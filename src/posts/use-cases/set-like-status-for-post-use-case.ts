import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { execute } from "auto";
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository";
import { PostsRepository } from "../posts.repository";
import { UsersRepository } from "src/users/users.repository";
import { CommentDBType } from "src/comments/comments.types";
import { Types } from "mongoose";
import { CommentsRepository } from "src/comments/comments.repository";
import { PostActionResult } from "../helpers/post.enum.action.result";
import { v4 as uuidv4 } from 'uuid';
import { CheckService } from "src/other.services/check.service";

export class SetLikeStatusForPostCommand {
    constructor(public userId: string, public postId: string,
      public status: string){}
  }

@CommandHandler(SetLikeStatusForPostCommand)
export class SetLikeStatusForPostUseCase implements ICommandHandler<SetLikeStatusForPostCommand>{
    constructor(
      private readonly blogRepository: BlogsRepository,
      private readonly postRepository: PostsRepository,
      private readonly usersRepository: UsersRepository,
      private readonly commentsRepository: CommentsRepository,
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

    const isUserAlreadyLikedPost = await this.

    const CommentDTO = new CommentDBType(
      uuidv4(),
      postId,
      content,
      new Date().toISOString(),
      userId,
      0,
      0,
    );
    const createdCommentId = await this.commentsRepository.createComment(
      CommentDTO,
    );
    if(!createdCommentId){
      return PostActionResult.NotCreated
    }
    return createdCommentId;
  }
}