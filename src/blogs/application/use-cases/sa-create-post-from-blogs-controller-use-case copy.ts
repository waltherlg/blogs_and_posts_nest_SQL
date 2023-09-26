import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from 'src/blogs/helpers/blogs.enum.action.result';
import { CreatePostByBlogsIdInputModelType } from 'src/blogs/api/blogger.blogs.controller';
import { PostsRepository } from 'src/posts/posts.repository';
import { PostDBType } from 'src/posts/posts.types';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class SaCreatePostFromBloggerControllerCommand {
  constructor( 
    public blogId: string, 
    public postCreateDto: CreatePostByBlogsIdInputModelType){}
}

@CommandHandler(SaCreatePostFromBloggerControllerCommand)
export class SaCreatePostFromBloggerControllerUseCase implements ICommandHandler<SaCreatePostFromBloggerControllerCommand> {
  constructor(private readonly postsRepository: PostsRepository, private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: SaCreatePostFromBloggerControllerCommand,
  ): Promise<BlogActionResult | string> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)
    if(!blog) return BlogActionResult.BlogNotFound
    // if(blog.userId !== command.userId) return BlogActionResult.NotOwner // not needed in this use case
    const postDto = new PostDBType(
      uuidv4(),
      command.postCreateDto.title,
      command.postCreateDto.shortDescription,
      command.postCreateDto.content,
      command.blogId,
      new Date().toISOString(),
      '00000000-0000-0000-0000-000000000000',
      0,
      0,
    )
    const newPostId = await this.postsRepository.createPost(postDto)
    if(!newPostId) return BlogActionResult.NotCreated
    return newPostId
  }
}
