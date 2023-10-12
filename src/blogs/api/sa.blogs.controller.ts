import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Delete,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrostracture/blogs.query.repository';
import {
  DEFAULT_BLOGS_QUERY_PARAMS,
  DEFAULT_QUERY_PARAMS,
  RequestBlogsQueryModel,
  RequestQueryParamsModel,
} from '../../models/types';


import { BasicAuthGuard } from '../../auth/guards/auth.guards';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../application/use-cases/sa-bind-blog-with-user-use-case';
import { BlogActionResult, handleBlogOperationResult } from '../helpers/blogs.enum.action.result';
import { IsBoolean } from 'class-validator';
import { SaBanBlogCommand } from '../application/use-cases/sa-ban-blog-use-case';
import { CreateBlogInputModelType, CreatePostByBlogsIdInputModelType, UpdateBlogInputModelType, UpdatePostByBlogsIdInputModelType } from './blogger.blogs.controller';
import { CreateBlogCommand } from '../application/use-cases/blogger-create-blog-use-case';
import { BlogNotFoundException, CustomNotFoundException, UnableException } from 'src/exceptions/custom.exceptions';
import { UpdateBlogByIdFromUriCommand } from '../application/use-cases/blogger-upadate-blog-using-id-from-uri-use-case';
import { DeleteBlogByIdFromUriCommand } from '../application/use-cases/blogger-delete-blog-by-id-use-case';
import { CreatePostFromBloggerControllerCommand } from '../application/use-cases/blogger-create-post-from-blogs-controller-use-case';
import { PostsQueryRepository } from 'src/posts/posts.query.repository';
import { CheckService } from 'src/other.services/check.service';
import { UpdatePostByIdFromBloggerControllerCommand } from '../application/use-cases/blogger-upadate-post-by-id-from-blogs-controller-use-case';
import { DeletePostByIdFromUriCommand } from '../application/use-cases/blogger-delete-post-by-id-use-case';
import { SaCreateBlogCommand } from '../application/use-cases/sa-create-blog-use-case copy';
import { SaCreatePostFromBloggerControllerCommand } from '../application/use-cases/sa-create-post-from-blogs-controller-use-case copy';

export class BanBlogInputModelType {
  @IsBoolean()
  isBanned: boolean;
}

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly checkService: CheckService,
  ) {}

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(@Param('blogId') blogId: string, @Param('userId') userId: string){
    const result: BlogActionResult = await this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
    handleBlogOperationResult(result)}

  // not needed in new homework
  // @Get()
  // async getAllBlogsForSa(@Query() queryParams: RequestBlogsQueryModel) {
  //   const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
  //   return await this.blogsQueryRepository.getAllBlogsForSa(mergedQueryParams);
  // }

  @Put(':blogId/ban')
  @HttpCode(204)
  async banBlog(@Param('blogId') blogId: string, @Body() banBlogDto: BanBlogInputModelType){
    const result = await this.commandBus.execute(new SaBanBlogCommand(blogId, banBlogDto))
    handleBlogOperationResult(result)
  }

  @Get()
  async getAllBlogs(@Query() queryParams: RequestBlogsQueryModel) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogs(mergedQueryParams);
  }
  
  @Post()
  async createBlog(@Body() blogCreateInputModel: CreateBlogInputModelType) {
    try {
    const newBlogsId = await this.commandBus.execute(new SaCreateBlogCommand(blogCreateInputModel));
    const newBlog = await this.blogsQueryRepository.getBlogById(newBlogsId);
    if (!newBlog) {
      throw new UnableException('blog creating');
    }
    return newBlog;
    } catch (error) {
      console.error('Произошла ошибка:', error.message)
    }


  }

  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Req() request,
    @Param('id') blogId: string,
    @Body() blogUpdateInputModel: UpdateBlogInputModelType,
  ) {  
    const result: BlogActionResult = await this.commandBus.execute(new UpdateBlogByIdFromUriCommand(
      blogId,
      request.user.userId,
      blogUpdateInputModel,
    ));
    handleBlogOperationResult(result)
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Req() request, @Param('id') blogId: string) {
    const result = await this.commandBus.execute(new DeleteBlogByIdFromUriCommand(blogId, request.user.userId));
    handleBlogOperationResult(result)
  }

  @Post(':id/posts')
  async saCreatePostByBlogsId(
    @Param('id') blogId: string,
    @Body() postCreateDto: CreatePostByBlogsIdInputModelType,
  ) {
    const result = await this.commandBus.execute(new SaCreatePostFromBloggerControllerCommand(blogId, postCreateDto))
    
    handleBlogOperationResult(result) 
    const newPost = await this.postsQueryRepository.getPostById(result);
    
    if (!newPost) {
      throw new UnableException('post creating');
    }
    return newPost;
  }

  @Get(':id/posts')
  async getAllPostsByBlogsId(
    @Req() request,
    @Param('id') blogId: string,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    if (!(await this.checkService.isBlogExist(blogId))) {
      throw new BlogNotFoundException();
    }
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    return await this.postsQueryRepository.getAllPostsByBlogsId(
      mergedQueryParams,
      blogId,
      request.user.userId,
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(@Req() request, 
  @Param('blogId') blogId: string, 
  @Param('postId') postId: string,
  @Body() postUpdateDto: UpdatePostByBlogsIdInputModelType){
    if(!await this.checkService.isBlogExist(blogId)){
      throw new CustomNotFoundException('blog')
    }
    const result: BlogActionResult = await this.commandBus.execute(new UpdatePostByIdFromBloggerControllerCommand(request.user.userId, blogId, postId, postUpdateDto))
    handleBlogOperationResult(result)
  }

  @Delete(':blogId/posts/:postId') 
  @HttpCode(204)
  async deletePost(@Req() request,
  @Param('blogId') blogId: string,
  @Param('postId') postId: string,){
    if(!await this.checkService.isBlogExist(blogId)){
      throw new CustomNotFoundException('blog')
    }
    const result: BlogActionResult = await this.commandBus.execute(new DeletePostByIdFromUriCommand(request.user.userId, blogId, postId))
    handleBlogOperationResult(result)
  }
}


