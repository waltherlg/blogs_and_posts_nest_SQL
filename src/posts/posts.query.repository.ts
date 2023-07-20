import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel } from '../models/types';
import { PostDocument, PostTypeOutput, Post } from './posts.types';
import { BlogDocument, Blog } from 'src/blogs/blogs.types';
import { validate as isValidUUID } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>,
  @InjectModel(Blog.name) private blogModel: Model<BlogDocument>, 
  @InjectDataSource() protected dataSource: DataSource) {}

  async getPostById(postId, userId?): Promise<PostTypeOutput | null> {
    if (!isValidUUID(postId)) {
      return null;
    }
    const query = `
      SELECT "Posts".*, "Blogs".name AS "blogName", "Users"."isBanned" AS "isUserBanned"
      FROM public."Posts"
      INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
      INNER JOIN "Users" ON "Blogs"."userId" = "Users"."userId"
      WHERE "postId" = $1 AND "Users"."isBanned" = false;
    `;
  
    const result = await this.dataSource.query(query, [postId])
    const post = result[0];
    if (!post){
      return null
    }
    return {
      id: post.postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "none",
          newestLikes: []
      },
    }
  }

    // {
    //   id: string;
    //   title: string;
    //   shortDescription: string;
    //   content: string;
    //   blogId: string;
    //   blogName: string;
    //   createdAt: string;
    //   extendedLikesInfo: {
    //       likesCount: number;
    //       dislikesCount: number;
    //       myStatus: string;
    //       newestLikes: {
    //           ...;
    //       }[];
    //   };
    // }

  async getAllPosts(mergedQueryParams, userId?) {
    const sortBy = mergedQueryParams.sortBy;   
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
    ];

    let query = `
    SELECT "Posts".*, "Blogs".name AS "blogName", "Users"."isBanned" AS "isUserBanned"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    INNER JOIN "Users" ON "Blogs"."userId" = "Users"."userId"
    WHERE "Users"."isBanned" = false;
    `;
    let countQuery = `
    SELECT "Posts".*, "Blogs".name AS "blogName", "Users"."isBanned" AS "isUserBanned"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    INNER JOIN "Users" ON "Blogs"."userId" = "Users"."userId"
    WHERE "Users"."isBanned" = false;
    `;

    query += ` ORDER BY "${queryParams[0]}" ${queryParams[1]}
    LIMIT ${queryParams[3]} OFFSET ${queryParams[4]};
    `;

    const postCountArr = await this.dataSource.query(countQuery);
    const postCount = parseInt(postCountArr[0].count);

    const posts = await this.dataSource.query(query);
    const postsForOutput = posts.map(post => {
      return {
        id: post.postId,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "none",
            newestLikes: []
        },
      }
    })

    const pageCount = Math.ceil(postCount / pageSize);

    const outputPosts = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: postCount,
      items: postsForOutput
    };
    return outputPosts;
  }

  async getAllPostsByBlogsId(
    mergedQueryParams,
    blogId,
    userId?,
  ): Promise<PaginationOutputModel<PostTypeOutput>> {
    const postCount = await this.postModel.countDocuments({ blogId: blogId, isBanned: false, isBlogBanned: false });
    const posts = await this.postModel
      .find({ blogId: blogId, isBanned: false, isBlogBanned: false })
      .skip(
        this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize),
      )
      .limit(+mergedQueryParams.pageSize)
      .sort({
        [mergedQueryParams.sortBy]: this.sortByDesc(
          mergedQueryParams.sortDirection,
        ),
      });

    const postsOutput = posts.map((post: PostDocument) => {
      const userPostStatus = post.likesCollection.find(
        (p) => p.userId === userId,
      );
      if (userPostStatus) {
        post.myStatus = userPostStatus.status;
      }
      return post.preparePostForOutput();
    });
    const pageCount = Math.ceil(postCount / +mergedQueryParams.pageSize);

    const outputPosts: PaginationOutputModel<PostTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: postCount,
      items: postsOutput,
    };
    return outputPosts;
  }

  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
