import { BlogsRepository } from '../../infrostracture/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs/dist';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string){}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(
    command: BindBlogWithUserCommand
  ): Promise<BlogActionResult> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)

    if(!blog) return BlogActionResult.BlogNotFound

    if(blog.userId !== null) return BlogActionResult.UserAlreadyBound

    //заглушка
    const result = await this.blogsRepository.bindBlogWithUser(command.blogId, command.userId)
    if (result) return BlogActionResult.Success
  }
}
