import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository";
import { PostsRepository } from "src/posts/posts.repository";
import { UsersRepository } from "src/users/users.repository";
import { CommentsRepository } from "src/comments/comments.repository";
import { CheckService } from "src/other.services/check.service";
import { LikesRepository } from "src/likes/likes.repository";
import { CommentLikeDbType, PostLikeDbType } from "src/likes/db.likes.types";
import { CommentActionResult } from "src/comments/helpers/comment.enum.action.result";

export class SetLikeStatusForCommentCommand {
    constructor(public userId: string, public commentId: string,
      public status: string){}
  }

@CommandHandler(SetLikeStatusForCommentCommand)
export class SetLikeStatusForCommentUseCase implements ICommandHandler<SetLikeStatusForCommentCommand>{
    constructor(
      private readonly commentRepository: CommentsRepository,
      private readonly likesRepository: LikesRepository,){}

async execute(command: SetLikeStatusForCommentCommand)
  : Promise<CommentActionResult | string> {
    const userId = command.userId
    const commentId = command.commentId
    const status = command.status

    const comment = await this.commentRepository.getCommentDbTypeById(commentId)
    if(!comment){
      return CommentActionResult.CommentNotFound
    }

    //check is user already liked this comment
    const commentLikeObject = await this.likesRepository.getCommentLikeObject(userId, commentId)
    //if user never set likestatus, create it
    
    if(!commentLikeObject){
      const commentLikeDto = new CommentLikeDbType(
        commentId,
        new Date().toISOString(),
        userId,
        null,
        false,
        status
      )
      const isLikeAdded = await this.likesRepository.addCommentLikeStatus(commentLikeDto)
      if(isLikeAdded){
        return CommentActionResult.Success
      } else {
        CommentActionResult.NotSaved
      }
    }

    if(commentLikeObject.status === status){
      return CommentActionResult.NoChangeNeeded
    }

    const islikeUpdated = await this.likesRepository.updateCommentLike(commentId, userId, status)
    if(islikeUpdated){
      return CommentActionResult.Success
    } else {
      return CommentActionResult.NotSaved
    }
  }
}