import { PostsRepository } from './posts.repository';
import { PostDBType } from './posts.types';
import { Types } from 'mongoose';
import { CreatePostInputModelType } from './api/public.posts.controller';
import { BlogsRepository } from '../blogs/infrostracture/blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogNotFoundException } from '../exceptions/custom.exceptions';
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogRepository: BlogsRepository,
  ) {}

  async updatePostById(postId, postUpdateInputModel): Promise<boolean> {
    const post = await this.postsRepository.getPostDBTypeById(postId);
    if (!post) {
      return false;
    }
    post.title = postUpdateInputModel.title;
    post.shortDescription = postUpdateInputModel.shortDescription;
    post.content = postUpdateInputModel.content;
    return await this.postsRepository.savePost(post);
  }
  async deletePostById(postId: string): Promise<boolean> {
    return await this.postsRepository.deletePostById(postId);
  }
}
