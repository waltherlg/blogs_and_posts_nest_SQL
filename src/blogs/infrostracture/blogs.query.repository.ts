import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDBType, BlogDocument, BlogTypeOutput, blogSaTypeOutput } from '../blogs.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel, RequestBannedUsersQueryModel } from '../../models/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>, 
  @InjectDataSource() protected dataSource: DataSource) {}

  async getBlogById(blogId): Promise<BlogTypeOutput | null> {
    if (!isValidUUID(blogId)) {
      return null;
    }
    const query = `
    SELECT "blogId" AS id, name, description, "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs"
    WHERE "blogId" = $1
    LIMIT 1
    `;
    const result = await this.dataSource.query(query, [blogId]); 
    return result[0];
  }

  async getAllBlogs(mergedQueryParams) {
    const blogsCount = await this.blogModel.countDocuments({
      name: new RegExp(mergedQueryParams.searchNameTerm, 'gi'),
    }, { isBlogBanned: false});
    let blogs;
    if (mergedQueryParams.searchNameTerm !== '') {
      blogs = await this.blogModel
        .find({ name: new RegExp(mergedQueryParams.searchNameTerm, 'gi') }, { isBlogBanned: false})
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    } else {
      blogs = await this.blogModel
        .find({ isBlogBanned: false})
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    }
    const blogsOutput = blogs.map((blog: BlogDocument) => {
      return blog.prepareBlogForOutput();
    });
    const pageCount = Math.ceil(blogsCount / +mergedQueryParams.pageSize);

    const outputBlogs: PaginationOutputModel<BlogTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: blogsCount,
      items: blogsOutput,
    };
    return outputBlogs;
  }

  
  async getAllBlogsForSa(mergedQueryParams): Promise<PaginationOutputModel<blogSaTypeOutput>> {
    const blogsCount = await this.blogModel.countDocuments({
      name: new RegExp(mergedQueryParams.searchNameTerm, 'gi'),
    });
    let blogs;
    if (mergedQueryParams.searchNameTerm !== '') {
      blogs = await this.blogModel
        .find({ name: new RegExp(mergedQueryParams.searchNameTerm, 'gi') } )
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    } else {
      blogs = await this.blogModel
        .find({})
        .skip(
          this.skipPage(
            mergedQueryParams.pageNumber,
            mergedQueryParams.pageSize,
          ),
        )
        .limit(+mergedQueryParams.pageSize)
        .sort({
          [mergedQueryParams.sortBy]: this.sortByDesc(
            mergedQueryParams.sortDirection,
          ),
        });
    }
    const blogsOutput: Array<blogSaTypeOutput> = blogs.map((blog: BlogDocument) => {
      return blog.prepareBlogForSaOutput();
    });
    const pageCount = Math.ceil(blogsCount / +mergedQueryParams.pageSize);

    const outputBlogs: PaginationOutputModel<blogSaTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: blogsCount,
      items: blogsOutput,
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
    WHERE "userId" = '${queryParams[6]}'

    `;
    let countQuery = `
    SELECT COUNT(*)
    FROM public."Blogs"
    WHERE "userId" = '${queryParams[6]}'
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
  
  private sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }
  
  private skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
