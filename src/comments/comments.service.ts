import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async deleteCommentById(commentId): Promise<boolean> {
    const isDeleted = await this.commentsRepository.deleteCommentById(
      commentId,
    );
    return isDeleted;
  }

  async updateCommentById(
    commentId: string,
    content: string,
  ): Promise<boolean> {
    return await this.commentsRepository.updateCommentById(commentId, content);
  }
}
