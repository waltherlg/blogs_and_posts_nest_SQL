import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RequestQueryParamsModel, DEFAULT_QUERY_PARAMS } from '../../models/types';
import {
  Length,
  Validate,
  MaxLength,
} from 'class-validator';
import { CheckService } from '../../other.services/check.service';
import { PostsQueryRepository } from '../posts.query.repository';

import {
  CustomNotFoundException,
  PostNotFoundException,
} from '../../exceptions/custom.exceptions';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import {
  BlogIdCustomValidator,
  LikeStatusValidator,
  StringTrimNotEmpty,
} from '../../middlewares/validators';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentForSpecificPostCommand } from '../use-cases/create-comment-for-specific-post-use-case';
import { SetLikeStatusForPostCommand } from '../use-cases/set-like-status-for-post-use-case'; 
import { handlePostActionResult } from '../helpers/post.enum.action.result';

export class CreatePostInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  @BlogIdCustomValidator()
  blogId: string;
}

export class UpdatePostInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  @BlogIdCustomValidator()
  blogId: string;
}
export class CreateCommentInputModelType {
  @StringTrimNotEmpty()
  @Length(20, 300)
  content: string;
}
export class SetLikeStatusForPostInputModel {
  @StringTrimNotEmpty()
  @MaxLength(100)
  @Validate(LikeStatusValidator)
  likeStatus: string;
}
@Controller('posts')
export class PostController {
  constructor(
    private readonly checkService: CheckService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getPostById(@Req() request, @Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPostById(
      postId,
      request.user.userId,
    );
    if (!post) {
      throw new PostNotFoundException();
    }
    return post;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getAllPosts(
    @Req() request,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    return await this.postsQueryRepository.getAllPosts(
      mergedQueryParams,
      request.user.userId,
    );
  }
  
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createCommentByPostId(
    @Req() request,
    @Param('id') postId: string,
    @Body() content: CreateCommentInputModelType,
  ) {
    const resultOrCommentId = await this.commandBus.execute(new CreateCommentForSpecificPostCommand(request.user.userId, postId, content.content))
    handlePostActionResult(resultOrCommentId)
    const createdComment = await this.commentsQueryRepository.getCommentById(resultOrCommentId)
    return createdComment
  }
  
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/comments')
  async getAllCommentsByPostId(
    @Req() request,
    @Param('id') postId: string,
    @Query() queryParams: RequestQueryParamsModel,
  ) {
    if (!(await this.checkService.isPostExist(postId))) {
      throw new CustomNotFoundException('post');
    }
    const mergedQueryParams = { ...DEFAULT_QUERY_PARAMS, ...queryParams };
    return await this.commentsQueryRepository.getAllCommentsByPostId(
      postId,
      mergedQueryParams,
      request.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatusForPost(
    @Req() request,
    @Param('id') postId: string,
    @Body()
    likeStatus: SetLikeStatusForPostInputModel,
  ) {
    const result = await this.commandBus.execute(new SetLikeStatusForPostCommand(
      request.user.userId,
      postId,
      likeStatus.likeStatus,
    ))
    handlePostActionResult(result)
  }
}
