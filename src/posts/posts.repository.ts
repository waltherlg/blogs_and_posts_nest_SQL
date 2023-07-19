import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { Post, PostDBType, PostDocument } from './posts.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

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
        $6,)
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
    if (!Types.ObjectId.isValid(postId)) {
      return false;
    }
    return this.postModel.findByIdAndDelete(postId);
  }

  async getPostDBTypeById(postId): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(postId)) {
      return null;
    }
    const post: PostDocument = await this.postModel.findById(postId);
    if (!post) {
      return null;
    }
    return post;
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
