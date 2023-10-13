import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { UpdatePostByBlogsIdInputModelType } from '../../../blogs/api/blogger.blogs.controller';
import { PostsRepository } from '../../../posts/posts.repository';

export class UpdatePostByIdFromBloggerControllerCommand {
  constructor(public userId: string, public blogsId: string, public postId: string, 
    public postUpdateDto: UpdatePostByBlogsIdInputModelType){}
}

@CommandHandler(UpdatePostByIdFromBloggerControllerCommand)
export class UpdatePostByIdFromBloggerControllerUseCase implements ICommandHandler<UpdatePostByIdFromBloggerControllerCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(
    command: UpdatePostByIdFromBloggerControllerCommand,
  ): Promise<BlogActionResult> {
    const postId = command.postId
    const post = await this.postsRepository.getPostDBTypeById(postId)
    if(!post) return BlogActionResult.PostNotFound
    if(post.userId !== command.userId) return BlogActionResult.NotOwner

    const title = command.postUpdateDto.title
    const shortDescription = command.postUpdateDto.shortDescription
    const content = command.postUpdateDto.content

    const result = await this.postsRepository.updatePostById(postId, title, shortDescription, content)
    if(result) {
      return BlogActionResult.Success
    } else { 
      return BlogActionResult.NotSaved
    }
  }
}
