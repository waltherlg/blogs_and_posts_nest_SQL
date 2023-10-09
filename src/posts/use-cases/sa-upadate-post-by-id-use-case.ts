import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult as PostActionResult } from '../../helpers/blogs.enum.action.result';
import { UpdatePostByBlogsIdInputModelType } from 'src/blogs/api/blogger.blogs.controller';
import { PostsRepository } from 'src/posts/posts.repository';

export class SaUpdatePostByIdCommand {
  constructor(public userId: string, public blogsId: string, public postId: string, 
    public postUpdateDto: UpdatePostByBlogsIdInputModelType){}
}

@CommandHandler(SaUpdatePostByIdCommand)
export class SaUpdatePostByIdUseCase implements ICommandHandler<SaUpdatePostByIdCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(
    command: SaUpdatePostByIdCommand,
  ): Promise<PostActionResult> {
    const postId = command.postId
    const post = await this.postsRepository.getPostDBTypeById(postId)
    if(!post) return PostActionResult.PostNotFound
    if(post.userId !== command.userId) return PostActionResult.NotOwner

    const title = command.postUpdateDto.title
    const shortDescription = command.postUpdateDto.shortDescription
    const content = command.postUpdateDto.content

    const result = await this.postsRepository.updatePostById(postId, title, shortDescription, content)
    if(result) {
      return PostActionResult.Success
    } else { 
      return PostActionResult.NotSaved
    }
  }
}
