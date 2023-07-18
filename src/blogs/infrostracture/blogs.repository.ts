import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDBType, BlogDocument, BlogTypeOutput } from '../blogs.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { log } from 'console';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  @InjectDataSource() protected dataSource: DataSource) {}

  async saveBlog(blog: HydratedDocument<BlogDBType>) {
    const result = await blog.save();
    return !!result;
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const query = `
    
    DELETE FROM  public."Blogs"
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query,[blogId]);
    return result[1] > 0;
  }

  async createBlog(blogDTO: BlogDBType): Promise<string> {
    const query = `
    INSERT INTO public."Blogs"(
      "blogId",
      "name",
      "isBlogBanned",
      "blogBanDate",
      "userId",
      "userName",
      description,
      "websiteUrl",
      "createdAt",
      "isMembership")
      VALUES (
      $1,  
      $2, 
      $3, 
      $4, 
      $5, 
      (SELECT login FROM public."Users" WHERE "userId" = $5),
      $6,
      $7,
      $8,
      $9
      )
      RETURNING "blogId"
    `;
    const result = await this.dataSource.query(query, [
      blogDTO.blogId,
      blogDTO.name,
      blogDTO.isBlogBanned,
      blogDTO.blogBanDate,
      blogDTO.userId,
      blogDTO.description,
      blogDTO.websiteUrl,
      blogDTO.createdAt,
      blogDTO.isMembership
    ])
    console.log(result);
    
    const blogId = result[0].blogId;
    return blogId;
  }

  async getBlogDBTypeById(blogId): Promise<BlogDocument | null> {
    const query = `
    SELECT * FROM public."Blogs"
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [
      blogId
    ]);
    return result[0];
  }

  async updateBlogById(blogId, name, description, websiteUrl): Promise<boolean>{
    const query = `
    UPDATE public."Blogs"
    SET name = $2, description = $3, "websiteUrl" = $4
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId, name, description, websiteUrl])
    const count = result[1];
    return count === 1
  }

  async isBlogExist(blogId): Promise<boolean> {
    const query = `
    SELECT COUNT(*) AS count
    FROM public."Blogs"
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId]);
    console.log('result isBlogExist ', result);
    return result;
  }

  async deleteAllBlogs() {
    await this.blogModel.deleteMany({});
  }
}
