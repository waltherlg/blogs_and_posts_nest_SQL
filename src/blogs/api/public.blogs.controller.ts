import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrostracture/blogs.query.repository';
import {
  DEFAULT_BLOGS_QUERY_PARAMS,
  RequestQueryParamsModel,
  RequestBlogsQueryModel,
  DEFAULT_QUERY_PARAMS,
} from '../../models/types';
import { MaxLength } from 'class-validator';
import { CheckService } from '../../other.services/check.service';
import { PostsQueryRepository } from '../../posts/posts.query.repository';

import {
  BlogNotFoundException,
  CustomisableException,
} from '../../exceptions/custom.exceptions';
import { IsCustomUrl, StringTrimNotEmpty } from '../../middlewares/validators';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

export class CreateBlogInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(15)
  name: string;
  @StringTrimNotEmpty()
  @MaxLength(500)
  description: string;
  @StringTrimNotEmpty()
  @IsCustomUrl({ message: 'Invalid URL format' })
  websiteUrl: string;
}

export class UpdateBlogInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(15)
  name: string;
  @StringTrimNotEmpty()
  @MaxLength(500)
  description: string;
  @StringTrimNotEmpty()
  @IsCustomUrl({ message: 'Invalid URL format' })
  websiteUrl: string;
}

export class CreatePostByBlogsIdInputModelType {
  @StringTrimNotEmpty()
  @MaxLength(30)
  title: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @StringTrimNotEmpty()
  @MaxLength(1000)
  content: string;
}
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly checkService: CheckService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() queryParams: RequestBlogsQueryModel) {
    const mergedQueryParams = { ...DEFAULT_BLOGS_QUERY_PARAMS, ...queryParams };
    return await this.blogsQueryRepository.getAllBlogs(mergedQueryParams);
  }

  @UseGuards(OptionalJwtAuthGuard)
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

  @Get(':id')
  async getBlogById(@Param('id') blogsId: string) {
    const blog = await this.blogsQueryRepository.getBlogById(blogsId);
    if (!blog) {
      throw new CustomisableException('blog', 'blog not found', 404);
    }
    return blog;
  }
}
