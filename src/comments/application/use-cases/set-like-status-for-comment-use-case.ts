import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository";
import { PostsRepository } from "src/posts/posts.repository";
import { UsersRepository } from "src/users/users.repository";
import { CommentsRepository } from "src/comments/comments.repository";
import { PostActionResult } from "src/posts/helpers/post.enum.action.result";
import { CheckService } from "src/other.services/check.service";
import { LikesRepository } from "src/likes/likes.repository";
import { PostLikeDbType } from "src/likes/likes.types";

export class SetLikeStatusForCommentCommand {
    constructor(public userId: string, public commentId: string,
      public status: string){}
  }

@CommandHandler(SetLikeStatusForCommentCommand)
export class SetLikeStatusForCommentUseCase implements ICommandHandler<SetLikeStatusForCommentCommand>{
    constructor(
      private readonly blogRepository: BlogsRepository,
      private readonly postRepository: PostsRepository,
      private readonly likesRepository: LikesRepository,
      private readonly checkService: CheckService){}

async execute(command: SetLikeStatusForCommentCommand)
  : Promise<PostActionResult | string> {
    const userId = command.userId
    const commentId = command.commentId
    const status = command.status

    const comment = await this.postRepository.getPostDBTypeById(commentId)
    if(!post){
      return PostActionResult.PostNotFound
    }
    const blog = await this.blogRepository.getBlogDBTypeById(post.blogId)
    if(!blog){
      return PostActionResult.BlogNotFound
    }

    const isUserBannedForBlog = await this.checkService.isUserBannedForBlog(blog.blogId, userId)
    if (isUserBannedForBlog) {
      return PostActionResult.UserBannedForBlog
    }

    //check is user already liked post
    const likeObject = await this.likesRepository.getPostLikeObject(userId, commentId)

    //if user never set likestatus, create it
    if(!likeObject){
      const postLikeDto = new PostLikeDbType(
        commentId,
        new Date().toISOString(),
        userId,
        null,
        false,
        status
      )
      const isLikeAdded = await this.likesRepository.addPostLikeStatus(postLikeDto)
      if(isLikeAdded){
        return PostActionResult.Success
      } else {
        PostActionResult.NotSaved
      }
    }

    if(likeObject.status === status){
      return PostActionResult.NoChangeNeeded
    }

    const islikeUpdated = await this.likesRepository.updatePostLike(commentId, userId, status)
    if(islikeUpdated){
      return PostActionResult.Success
    } else {
      return PostActionResult.NotSaved
    }



    



  }
}