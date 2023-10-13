
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';



import { PostActionResult } from '../helpers/post.enum.action.result';
import { PostsRepository } from '../posts.repository';
import { UpdatePostByBlogsIdInputModelType } from '../../blogs/api/blogger.blogs.controller';

export class SaUpdatePostByIdCommand {
  constructor(public blogsId: string, public postId: string, 
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
