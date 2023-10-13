import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogActionResult } from "../../../blogs/helpers/blogs.enum.action.result";
import { PostsRepository } from "../../../posts/posts.repository";

export class SaDeletePostByIdFromUriCommand {
    constructor(public blogId: string, public postId: string){}
}

@CommandHandler(SaDeletePostByIdFromUriCommand)
export class SaDeletePostByIdFromUriUseCase implements ICommandHandler<SaDeletePostByIdFromUriCommand>{
constructor(private readonly postsRepository: PostsRepository){}
async execute(command: SaDeletePostByIdFromUriCommand): Promise<BlogActionResult> {
    const post = await this.postsRepository.getPostDBTypeById(command.postId)   
    if(!post) return BlogActionResult.PostNotFound
    const isDeleted = await this.postsRepository.deletePostById(command.postId)
    if (!isDeleted) return BlogActionResult.NotDeleted
    return BlogActionResult.Success
}
}