import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  UpdateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';

export class UpdateBlogByIdFromUriCommand {
  constructor(public blogId: string, public userId: string,
    public blogUpdateInputModel: UpdateBlogInputModelType){}
}

@CommandHandler(UpdateBlogByIdFromUriCommand)
export class UpdateBlogByIdFromUriUseCase implements ICommandHandler<UpdateBlogByIdFromUriCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: UpdateBlogByIdFromUriCommand,
  ): Promise<BlogActionResult> {
     const name = command.blogUpdateInputModel.name;
     const description = command.blogUpdateInputModel.description;
     const websiteUrl = command.blogUpdateInputModel.websiteUrl;

    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId);
    
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== command.userId) return BlogActionResult.NotOwner

    const result = await this.blogsRepository.updateBlogById(command.blogId, name, description, websiteUrl);
    if(result) {
      return BlogActionResult.Success
    } else { 
      return BlogActionResult.NotSaved
    }
  }
}
