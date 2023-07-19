import { Injectable } from '@nestjs/common';

import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { BanUserForBlogInputModelType } from 'src/blogs/api/blogger.blogs.controller';
import { BannedBlogUsersType, Blog } from 'src/blogs/blogs.types';
import { th } from 'date-fns/locale';
import { UsersRepository } from 'src/users/users.repository';
import { BanBlogInputModelType } from 'src/blogs/api/sa.blogs.controller';
import { PostsRepository } from 'src/posts/posts.repository';

export class SaBanBlogCommand {
  constructor(public blogId: string, public banBlogDto: BanBlogInputModelType){}
}

@CommandHandler(SaBanBlogCommand)
export class SaBanBlogUseCase implements ICommandHandler<SaBanBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, private readonly postsRepository: PostsRepository,) {}

  async execute(
    command: SaBanBlogCommand,
  ): Promise<BlogActionResult> {
    const blogId = command.blogId
    const newBanStatus = command.banBlogDto.isBanned

    const blog = await this.blogsRepository.getBlogDBTypeById(blogId);
    if(!blog) return BlogActionResult.BlogNotFound

    if(blog.isBlogBanned === newBanStatus){
      return BlogActionResult.NoChangeNeeded
    }

    blog.isBlogBanned = newBanStatus
    let blogBanDate

    if(newBanStatus === true){
      blogBanDate = new Date().toISOString()
    } else {
      blogBanDate = null
    }

    //заглушка
    const isBlogSave = await this.blogsRepository.newBanStatus(blogId, newBanStatus, blogBanDate)
    
    if(isBlogSave){
      return BlogActionResult.Success
    } else {
      return BlogActionResult.NotSaved
    }
  }
}
