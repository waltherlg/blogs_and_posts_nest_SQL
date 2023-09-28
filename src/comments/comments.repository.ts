import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDocument, Comment, CommentDBType } from './comments.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectDataSource() protected dataSource: DataSource
  ) {}
  async saveComment(comment: CommentDocument) {
    const result = await comment.save();
    return !!result;
  }

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
    if (!Types.ObjectId.isValid(commentId)) {
      return null;
    }
    const comment: CommentDocument = await this.commentModel.findById(
      commentId,
    );
    if (!comment) {
      return null;
    }
    return comment;
  }
  
  async deleteCommentById(commentId): Promise<boolean> {
    if (!Types.ObjectId.isValid(commentId)) {
      return false;
    }
    const isDeleted = await this.commentModel.deleteOne({ _id: commentId });
    return !!isDeleted;
  }

  async updateCommentById(commentId, content): Promise<boolean> {
    if (!Types.ObjectId.isValid(commentId)) {
      return false;
    }
    const comment: CommentDocument = await this.commentModel.findById(
      commentId,
    );
    if (!comment) {
      return false;
    }
    comment.content = content;
    const result = await comment.save();
    return !!result;
  }

}
