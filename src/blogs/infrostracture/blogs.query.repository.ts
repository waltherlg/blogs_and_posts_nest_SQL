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
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = mergedQueryParams;
    const searchQuery = {
      userId: userId,
      isBlogBanned: false,
      ...(searchNameTerm !== '' ? { name: new RegExp(searchNameTerm, 'gi') } : {})
    };
  
    const [blogsCount, blogs] = await Promise.all([
      this.blogModel.countDocuments(searchQuery),
      this.blogModel
        .find(searchQuery)
        .skip(this.skipPage(pageNumber, pageSize))
        .limit(+pageSize)
        .sort({ [sortBy]: this.sortByDesc(sortDirection) })
    ]);
    
    const blogsOutput = blogs.map(blog => blog.prepareBlogForOutput());
    const pageCount = Math.ceil(blogsCount / +pageSize);
  
    const outputBlogs = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: blogsCount,
      items: blogsOutput
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
