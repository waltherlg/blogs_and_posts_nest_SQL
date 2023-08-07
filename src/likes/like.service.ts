import { CommentsRepository } from '../comments/comments.repository';
import { UsersRepository } from '../users/users.repository';
import { PostsRepository } from '../posts/posts.repository';
import { Injectable } from '@nestjs/common/decorators';
import { PostDocument } from '../posts/posts.types';
import { CommentDocument } from 'src/comments/comments.types';

@Injectable()
export class LikeService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async updatePostLike(
    userId: string,
    postsId: string,
    status: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.getUserDBTypeById(userId);
    if (!user) return false;
    const post: PostDocument = await this.postsRepository.getPostDBTypeById(
      postsId,
    );
    if (!post) return false;
    const userPostStatus = post.likesCollection.find(
      (post) => post.userId === userId,
    );
    if (!userPostStatus) {
      const createdAt = new Date();
      const newLike = {
        addedAt: createdAt.toISOString(),
        userId,
        login: user.login,
        isUserBanned: false,
        status: status,
      };
      post.likesCollection.push(newLike);
      const result = await this.postsRepository.savePost(post);
      return result;
    }
    userPostStatus.status = status;
    post.markModified('likesCollection');
    const result = await this.postsRepository.savePost(post);
    return result;
  }

  async updateCommentLike(
    userId: string,
    commentId: string,
    status: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.getUserDBTypeById(userId);
    if (!user) return false;
    const comment: CommentDocument = await this.commentsRepository.getCommentDbTypeById(
      commentId,
    );
    if (!comment) return false;
    const userCommentStatus = comment.likesCollection.find(
      (post) => post.userId === userId,
    );
    if (!userCommentStatus) {
      const createdAt = new Date();
      const newLike = {
        addedAt: createdAt.toISOString(),
        userId,
        login: user.login,
        isUserBanned: false,
        status: status,
      };
      comment.likesCollection.push(newLike);
      const result = await this.commentsRepository.saveComment(comment);
      return result;
    }
    userCommentStatus.status = status;
    comment.markModified('likesCollection');
    const result = await this.commentsRepository.saveComment(comment);
    return result;
  }
}
