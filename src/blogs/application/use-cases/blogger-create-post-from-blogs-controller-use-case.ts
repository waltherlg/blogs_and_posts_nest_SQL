import { BlogsRepository } from '../../infrostracture/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../../blogs/helpers/blogs.enum.action.result';
import { CreatePostByBlogsIdInputModelType } from '../../../blogs/api/blogger.blogs.controller';
import { PostsRepository } from '../../../posts/posts.repository';
import { PostDBType } from '../../../posts/posts.types';
import { v4 as uuidv4 } from 'uuid';

export class CreatePostFromBloggerControllerCommand {
  constructor(
    public userId: string, 
    public blogId: string, 
    public postCreateDto: CreatePostByBlogsIdInputModelType){}
}

@CommandHandler(CreatePostFromBloggerControllerCommand)
export class CreatePostFromBloggerControllerUseCase implements ICommandHandler<CreatePostFromBloggerControllerCommand> {
  constructor(private readonly postsRepository: PostsRepository, private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: CreatePostFromBloggerControllerCommand,
  ): Promise<BlogActionResult | string> {
    const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId)
    if(!blog) return BlogActionResult.BlogNotFound
    if(blog.userId !== command.userId) return BlogActionResult.NotOwner
    const postDto = new PostDBType(
      uuidv4(),
      command.postCreateDto.title,
      command.postCreateDto.shortDescription,
      command.postCreateDto.content,
      command.blogId,
      new Date().toISOString(),
      blog.userId,
      0,
      0,
    )
    const newPostId = await this.postsRepository.createPost(postDto)
    if(!newPostId) return BlogActionResult.NotCreated
    return newPostId
  }
}
