import { Injectable } from '@nestjs/common';
import { BannedBlogUsersType, BlogDBType, BlogTypeOutput } from '../blogs.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteBlogById(blogId: string): Promise<boolean> {
    if (!isValidUUID(blogId)) {
      return false;
    }
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
    
    const blogId = result[0].blogId;
    return blogId;
  }

  async getBlogDBTypeById(blogId): Promise<BlogDBType | null> {
    if (!isValidUUID(blogId)) {
      return null;
    }
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
    if (!isValidUUID(blogId)) {
      return false;
    }
    const query = `
    UPDATE public."Blogs"
    SET name = $2, description = $3, "websiteUrl" = $4
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId, name, description, websiteUrl])
    const count = result[1];
    return count === 1
  }

  async bindBlogWithUser(blogId, userId){
    if (!isValidUUID(blogId) || !isValidUUID(userId)) {
      return false;
    }
    const query = `
    UPDATE public."Blogs"
    SET "userId" = $2
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId, userId])
    const count = result[1];
    return count === 1
  }

  async isBlogExist(blogId): Promise<boolean> {
    if (!isValidUUID(blogId)) {
      return false;
    }
    const query = `
    SELECT COUNT(*) AS count
    FROM public."Blogs"
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId]);
    const count = result[0].count;
    return count > 0;
  }

  async newBanStatus(blogId, newBanStatus: boolean, newBanDate): Promise<boolean>{
    if (!isValidUUID(blogId)) {
      return false;
    }
    const query = `
    UPDATE public."Blogs"
    SET "isBlogBanned" = $2, "blogBanDate" = $3
    WHERE "blogId" = $1
    `
    const result = await this.dataSource.query(query, [blogId, newBanStatus, newBanDate])
    const count = result[1];
    return count === 1
  }

  //get list of users, banned for that blog
  async getBlogBannedUsers(blogId){
    if (!isValidUUID(blogId)) {
      return null;
    }
    const query = `
    SELECT * FROM public."BlogBannedUsers"
    WHERE "blogId" = $1
    `;
    const result = await this.dataSource.query(query, [
      blogId
    ]);

    return result
  }

  // check is user banned for that blog or not
  async isUserBannedForBlog(blogId, userId){
    if (!isValidUUID(blogId) || !isValidUUID(userId)) {
      return false;
    }
    const query = `
    SELECT COUNT(*) AS count
    FROM public."BlogBannedUsers"
    WHERE "blogId" = $1 AND "bannedUserId" = $2
    `
    const result = await this.dataSource.query(query, [blogId, userId]);
    const count = result[0].count;
    return count > 0;
  }

  
  async addUserToBlogBanList(banUserInfo: BannedBlogUsersType): Promise<boolean>{
    const query = `
    INSERT INTO public."BlogBannedUsers"(
      "blogId",
      "bannedUserId",
      "banDate",
      "banReason")
      VALUES (
      $1,  
      $2, 
      $3, 
      $4
      )
      RETURNING 'User added to ban list.' as confirmation;
    `;
    const result = await this.dataSource.query(query, [
      banUserInfo.blogId,
      banUserInfo.bannedUserId,
      banUserInfo.banDate,
      banUserInfo.banReason,
    ])
    const confirmationMessage = result[0].confirmation;
    if(confirmationMessage){
      return true;
    } else {
      return false
    }   
  }

  async removeUserFromBlogBanList(blogId, userId):Promise<boolean>{
    if (!isValidUUID(blogId) || !isValidUUID(userId)) {
      return false;
    }
    const query = `
    DELETE FROM public."BlogBannedUsers"
    WHERE "blogId" = $1 AND "bannedUserId" = $2
    `
    const result = await this.dataSource.query(query,[blogId, userId]);
    return result[1] > 0;
  }
}
