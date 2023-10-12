import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs/infrostracture/blogs.repository";
import { PostsRepository } from "../posts.repository";
import { PostActionResult } from "../helpers/post.enum.action.result";
import { CheckService } from "../../other.services/check.service";
import { LikesRepository } from "../../likes/likes.repository";
import { PostLikeDbType } from "../../likes/db.likes.types";

export class SetLikeStatusForPostCommand {
    constructor(public userId: string, public postId: string,
      public status: string){}
  }

@CommandHandler(SetLikeStatusForPostCommand)
export class SetLikeStatusForPostUseCase implements ICommandHandler<SetLikeStatusForPostCommand>{
    constructor(
      private readonly blogRepository: BlogsRepository,
      private readonly postRepository: PostsRepository,
      private readonly likesRepository: LikesRepository,
      private readonly checkService: CheckService){}

async execute(command: SetLikeStatusForPostCommand)
  : Promise<PostActionResult | string> {
    const userId = command.userId
    const postId = command.postId
    const status = command.status

    const post = await this.postRepository.getPostDBTypeById(postId)
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
    const likeObject = await this.likesRepository.getPostLikeObject(userId, postId)
  
    //if user never set likestatus, create it
    if(!likeObject){
      const postLikeDto = new PostLikeDbType(
        postId,
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
        return PostActionResult.NotSaved
      }
    }

    if(likeObject.status === status){
      return PostActionResult.NoChangeNeeded
    }

    const islikeUpdated = await this.likesRepository.updatePostLike(postId, userId, status)
    if(islikeUpdated){
      return PostActionResult.Success
    } else {
      return PostActionResult.NotSaved
    }



    



  }
}