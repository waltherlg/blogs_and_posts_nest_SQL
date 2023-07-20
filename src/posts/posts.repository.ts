import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Post, PostDBType, PostDocument } from './posts.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>,
  @InjectDataSource() protected dataSource: DataSource) {}

  async savePost(post: PostDocument) {
    const result = await post.save();
    return !!result;
  }

  async createPost(postDTO: PostDBType): Promise<string> {
    const query = `
    INSERT INTO public."Posts"(
      "postId",
      title,
      "shortDescription",
      content,
      "blogId",
      "createdAt")
      VALUES (
        $1,  
        $2, 
        $3, 
        $4, 
        $5, 
        $6)
      RETURNING "postId"
    `;
    const result = await this.dataSource.query(query, [
      postDTO.postId,
      postDTO.title,
      postDTO.shortDescription,
      postDTO.content,
      postDTO.blogId,
      postDTO.createdAt
    ])
    const postId = result[0].postId;
    return postId;
  }

  async deletePostById(postId: string): Promise<boolean> {
    if (!isValidUUID(postId)) {
      return false;
    }
    const query = `
    DELETE FROM  public."Posts"
    WHERE "postId" = $1
    `
    const result = await this.dataSource.query(query,[postId]);
    return result[1] > 0;
  }

  async getPostDBTypeById(postId): Promise<PostDocument | null> {
    if (!isValidUUID(postId)) {
      return null;
    }
    const query = `
    SELECT * FROM public."Posts"
    WHERE "postId" = $1
    `
    const result = await this.dataSource.query(query, [postId]);    
    return result[0];
  }

 async getAllPostsByUserId(userId): Promise<Array<PostDBType>>{
  return await this.postModel.find({userId: userId})
 }

 async setBanStatusForPosts(userId: string, isBanned: boolean): Promise<boolean>{
  const banPostsResult = await this.postModel.updateMany({userId: userId}, {$set: {isBanned: isBanned}})
  const banLikesPostResult = await this.postModel.updateMany(
    { "likesCollection.userId": userId },
    { $set: { "likesCollection.$[elem].isBanned": isBanned } },
    { arrayFilters: [{ "elem.userId": userId }] }
  );

  return !!banLikesPostResult
 }

  async deleteAllPosts() {
    await this.postModel.deleteMany({});
  }
}
