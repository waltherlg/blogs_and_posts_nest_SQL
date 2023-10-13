import { BlogDBType } from '../../blogs.types';
import { BlogsRepository } from '../../infrostracture/blogs.repository';
import {
  CreateBlogInputModelType,
} from '../../api/public.blogs.controller';
import { CommandHandler } from '@nestjs/cqrs/dist';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { UsersRepository } from '../../../users/users.repository';
import { v4 as uuidv4 } from 'uuid';

export class SaCreateBlogCommand {
  constructor(public blogCreateInputModel: CreateBlogInputModelType){}
}

@CommandHandler(SaCreateBlogCommand)
export class SaCreateBlogUseCase implements ICommandHandler<SaCreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, private readonly usersRepository: UsersRepository) {}
  async execute(
    command: SaCreateBlogCommand
  ): Promise<string> {
    const blogDTO = new BlogDBType(
      uuidv4(),
      command.blogCreateInputModel.name,
      false,
      null,
      '00000000-0000-0000-0000-000000000000',    
      command.blogCreateInputModel.description,
      command.blogCreateInputModel.websiteUrl,
      new Date().toISOString(),
      false,
    );
    const newBlogsId = await this.blogsRepository.createBlog(blogDTO);
    return newBlogsId;
  }
}
