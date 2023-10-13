import { BlogsRepository } from '../../infrostracture/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { BanBlogInputModelType } from '../../../blogs/api/sa.blogs.controller';

export class SaBanBlogCommand {
  constructor(public blogId: string, public banBlogDto: BanBlogInputModelType){}
}

@CommandHandler(SaBanBlogCommand)
export class SaBanBlogUseCase implements ICommandHandler<SaBanBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

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

    const isBlogSave = await this.blogsRepository.newBanStatus(blogId, newBanStatus, blogBanDate)
    
    if(isBlogSave){
      return BlogActionResult.Success
    } else {
      return BlogActionResult.NotSaved
    }
  }
}
