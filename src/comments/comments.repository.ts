import { Injectable } from '@nestjs/common';
import { CommentDBType } from './comments.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async createComment(commentDTO: CommentDBType): Promise<string> {
    const query = `
    INSERT INTO public."Comments"(
      "commentId",
      "postId",
      content,
      "createdAt",
      "userId")
    VALUES (
      $1,  
      $2, 
      $3, 
      $4,
      $5)
      RETURNING "commentId" 
    `;
    const result = await this.dataSource.query(query, [
      commentDTO.commentId,
      commentDTO.postId,
      commentDTO.content,
      commentDTO.createdAt,
      commentDTO.userId
    ])
    const commentId = result[0].commentId;
    return commentId
  }

  async isCommentExist(commentId): Promise<boolean> {
    if (!isValidUUID(commentId)) {
      return false;
    }
    const query = `
    SELECT COUNT(*) AS count
    FROM public."Comments"
    WHERE "commentId" = $1
  `;
  const result = await this.dataSource.query(query, [commentId]);
  const count = result[0].count;
  return count > 0;   
  }

  async getCommentDbTypeById(commentId) {
    if (!isValidUUID(commentId)) {
      return null;
    }
    const query = `
    SELECT * FROM public."Comments"
    WHERE "commentId" = $1
    `
    const result = await this.dataSource.query(query, [commentId])
    const comment = result[0];
    if(!comment){
      return null
    }
    return comment;
  }
  
  async deleteCommentById(commentId): Promise<boolean> {
    if (!isValidUUID(commentId)) {
      return false;
    }
    const query = `
    DELETE FROM  public."Comments"
    WHERE "commentId" = $1
    `
    const result = await this.dataSource.query(query,[commentId]);
    return result[1] > 0;
  }

  async updateCommentById(commentId, content): Promise<boolean> {
    const query = `
    UPDATE public."Comments"
    SET "content" = $2
    WHERE "commentId" = $1
    `
    const result = await this.dataSource.query(query, [commentId, content])
    const count = result[1];
    return count === 1
  }
}
