import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs/infrostracture/blogs.repository";
import { PostsRepository } from "../posts.repository";
import { UsersRepository } from "../../users/users.repository";
import { CommentDBType } from "../../comments/comments.types";
import { CommentsRepository } from "../../comments/comments.repository";
import { PostActionResult } from "../helpers/post.enum.action.result";
import { v4 as uuidv4 } from 'uuid';
import { CheckService } from "../../other.services/check.service";

export class CreateCommentForSpecificPostCommand {
    constructor(public userId: string, public postId: string,
      public content: string){}
  }

@CommandHandler(CreateCommentForSpecificPostCommand)
export class CreateCommentForSpecificPostUseCase implements ICommandHandler<CreateCommentForSpecificPostCommand>{
    constructor(
      private readonly blogRepository: BlogsRepository,
      private readonly postRepository: PostsRepository,
      private readonly usersRepository: UsersRepository,
      private readonly checkService: CheckService,
      private readonly commentsRepository: CommentsRepository,){}

async execute(command: CreateCommentForSpecificPostCommand)
  : Promise<PostActionResult | string> {
    const userId = command.userId
    const postId = command.postId
    const content = command.content

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