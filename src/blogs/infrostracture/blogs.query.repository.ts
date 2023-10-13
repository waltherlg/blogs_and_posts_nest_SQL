import { Injectable } from '@nestjs/common';
import { BlogTypeOutput, blogSaTypeOutput } from '../blogs.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogById(blogId): Promise<BlogTypeOutput | null> {
    if (!isValidUUID(blogId)) {
      return null;
    }
    const query = `
    SELECT "blogId" AS id, name, description, "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE "blogId" = $1 AND "isBlogBanned" = false
    LIMIT 1
    `;
    const result = await this.dataSource.query(query, [blogId]); 
    return result[0];
  }

  async getAllBlogs(mergedQueryParams) {
    const searchNameTerm = mergedQueryParams.searchNameTerm;
    const sortBy = mergedQueryParams.sortBy;   
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      `%${searchNameTerm}%`,
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
    ];

    let query = `
    SELECT "Blogs".*
    FROM public."Blogs"
    `;
    let countQuery = `
    SELECT COUNT(*)
    FROM public."Blogs"
    `;

    if (searchNameTerm !== ''){
      query += `WHERE name ILIKE '${queryParams[0]}' AND "isBlogBanned" = false`
      countQuery += `WHERE name ILIKE '${queryParams[0]}' AND "isBlogBanned" = false`;
    }

    if (searchNameTerm === ''){
      query += `WHERE "isBlogBanned" = false`
      countQuery += `WHERE "isBlogBanned" = false`;
    }

    query += ` ORDER BY "${queryParams[1]}" ${queryParams[2]}
    LIMIT ${queryParams[4]} OFFSET ${queryParams[5]};
    `;

    const blogsCountArr = await this.dataSource.query(countQuery);
    const blogsCount = parseInt(blogsCountArr[0].count);

    const blogs = await this.dataSource.query(query);
    const blogsForOutput = blogs.map(blog => {
      return {
          id: blog.blogId, 
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: blog.isMembership,
      }
    })

    const pageCount = Math.ceil(blogsCount / pageSize);

    const outputBlogs = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: blogsCount,
      items: blogsForOutput
    };
    return outputBlogs;
  }

  
  async getAllBlogsForSa(mergedQueryParams) {
    const searchNameTerm = mergedQueryParams.searchNameTerm;
    const sortBy = mergedQueryParams.sortBy;   
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      `%${searchNameTerm}%`,
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
    ];

    let query = `
    SELECT "Blogs".*, "Users".login
    FROM public."Blogs"
    INNER JOIN "Users"
    ON "Blogs"."userId" = "Users"."userId"
    `;
    let countQuery = `
    SELECT COUNT(*)
    FROM public."Blogs"
    `;

    if (searchNameTerm !== ''){
      query += `WHERE name ILIKE '${queryParams[0]}'`
      countQuery += `WHERE name ILIKE '${queryParams[0]}'`;
    }

    query += ` ORDER BY "${queryParams[1]}" ${queryParams[2]}
    LIMIT ${queryParams[4]} OFFSET ${queryParams[5]};
    `;

    const blogsCountArr = await this.dataSource.query(countQuery);
    const blogsCount = parseInt(blogsCountArr[0].count);

    const blogs = await this.dataSource.query(query);
    const blogsForOutput = blogs.map(blog => {
      return {
          id: blog.blogId, 
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: blog.isMembership,
          blogOwnerInfo:{
            userId: blog.userId,
            userLogin: blog.login,
          },
          banInfo: {
            isBanned: blog.isBlogBanned,
            banDate: blog.blogBanDate,
          }

      }
    })

    const pageCount = Math.ceil(blogsCount / pageSize);

    const outputBlogs = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: blogsCount,
      items: blogsForOutput
    };
    return outputBlogs;
  }

  async getAllBlogsForCurrentUser(mergedQueryParams, userId) {
    const searchNameTerm = mergedQueryParams.searchNameTerm;
    const sortBy = mergedQueryParams.sortBy;   
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      `%${searchNameTerm}%`,
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
      userId
    ];

    let query = `
    SELECT "blogId" AS id, name, description, "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE "userId" = '${queryParams[6]}' AND "isBlogBanned" = false

    `;
    let countQuery = `
    SELECT COUNT(*)
    FROM public."Blogs"
    WHERE "userId" = '${queryParams[6]}' AND "isBlogBanned" = false
    `;

    if (searchNameTerm !== ''){
      query += `AND name ILIKE '${queryParams[0]}'`
      countQuery += `AND name ILIKE '${queryParams[0]}'`;
    }

    query += ` ORDER BY "${queryParams[1]}" ${queryParams[2]}
    LIMIT ${queryParams[4]} OFFSET ${queryParams[5]};
    `;

    const blogsCountArr = await this.dataSource.query(countQuery);
    const blogsCount = parseInt(blogsCountArr[0].count);

    const blogs = await this.dataSource.query(query);

    const pageCount = Math.ceil(blogsCount / pageSize);

    const outputBlogs = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: blogsCount,
      items: blogs
    };
    return outputBlogs;
  }
}
