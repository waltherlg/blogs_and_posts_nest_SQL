import { Injectable } from '@nestjs/common';
import { PaginationOutputModel } from '../models/types';
import { PostTypeOutput } from './posts.types';
import { validate as isValidUUID } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeDbType } from '../likes/db.likes.types';

@Injectable()
export class PostsQueryRepository {
  constructor(
  @InjectDataSource() protected dataSource: DataSource) {}

  async getPostById(postId, userId?): Promise<PostTypeOutput | null> {
    if (!isValidUUID(postId)) {
      return null; 
    }
    // const query = `
    //   SELECT "Posts".*, "Blogs".name AS "blogName", "Blogs"."isBlogBanned", "Users"."isUserBanned"
    //   FROM public."Posts"
    //   INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    //   INNER JOIN "Users" ON "Blogs"."userId" = "Users"."userId"
    //   WHERE "postId" = $1 AND "Users"."isUserBanned" = false AND "Blogs"."isBlogBanned" = false;
    // `;

    //query without UsersTable 
    // this query dont check is user (blogger) banned, because all blogs made by SA
    const query = `
    SELECT "Posts".*, "Blogs".name AS "blogName", "Blogs"."isBlogBanned"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "postId" = $1 AND "Blogs"."isBlogBanned" = false;
  `;

    const newestLikesQuery = `
    SELECT "addedAt", "login", "userId" 
    FROM public."PostLikes"
    WHERE "postId" = $1 AND "status" = 'Like' AND "isUserBanned" = false
    ORDER BY "addedAt" DESC
    LIMIT 3;
    `
    const newestLikes = await this.dataSource.query(newestLikesQuery, [postId])

    let myStatus = "None"
    if(userId){
      const usersLike = await this.getPostLikeObject(userId, postId)
      if(usersLike){
        myStatus = usersLike.status
      }
    }
  
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
          likesCount: parseInt(post.likesCount),
          dislikesCount: parseInt(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: newestLikes
      },
    }
  }

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
    SELECT "Posts".*, "Blogs".name AS "blogName", "Blogs"."isBlogBanned"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Blogs"."isBlogBanned" = false
    `;
    let countQuery = `
    SELECT COUNT(*)
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Blogs"."isBlogBanned" = false
    ;`;

    query += ` ORDER BY "${queryParams[0]}" ${queryParams[1]}
    LIMIT ${queryParams[3]} OFFSET ${queryParams[4]};
    `;

    const postCountArr = await this.dataSource.query(countQuery);
    const postCount = parseInt(postCountArr[0].count);    

    const posts = await this.dataSource.query(query);
    
    const postLikesObjectQuery = `
    SELECT * FROM public."PostLikes"
    ORDER BY "addedAt" DESC;
    `
    const postLikesObjectArray = await this.dataSource.query(postLikesObjectQuery)
    
    const onlyLikeObjects = postLikesObjectArray.filter(likeObject => likeObject.status === "Like" && likeObject.isUserBanned === false)
    console.log('onlyLikeObjects ', onlyLikeObjects);
    
  
    const postsForOutput = posts.map(post => {

      const thisPostLikes = onlyLikeObjects.filter(likeObj => likeObj.postId === post.postId)

      const newestLikes = thisPostLikes.slice(0, 3).map(like => {return{
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login
      }})
    
      let myStatus = "None"
      if(userId){
        const foundLike = postLikesObjectArray.find(postLikeObject => postLikeObject.postId === post.postId && postLikeObject.userId === userId)
        if(foundLike){
          myStatus = foundLike.status
        }
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
            likesCount: parseInt(post.likesCount),
            dislikesCount: parseInt(post.dislikesCount),
            myStatus: myStatus,
            newestLikes: newestLikes
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
      blogId
    ];

    let query = `
    SELECT "Posts".*, "Blogs".name AS "blogName", "Blogs"."isBlogBanned"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Posts"."blogId" = '${queryParams[5]}' AND "Blogs"."isBlogBanned" = false
    `;
    let countQuery = `
    SELECT COUNT(*) as "count"
    FROM public."Posts"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Posts"."blogId" = '${queryParams[5]}' AND "Blogs"."isBlogBanned" = false
    `;

    query += ` ORDER BY "${queryParams[0]}" ${queryParams[1]}
    LIMIT ${queryParams[3]} OFFSET ${queryParams[4]};
    `;

    const postLikesObjectQuery = `
    SELECT "PostLikes".*, "Posts"."postId", "Blogs"."isBlogBanned"
    FROM public."PostLikes"
    INNER JOIN "Posts" ON "PostLikes"."postId" = "Posts"."postId"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Blogs"."blogId" = '${queryParams[5]}' AND "PostLikes"."isUserBanned" = false
    ORDER BY "PostLikes"."addedAt" DESC;
`;
    const postLikesObjectArray = await this.dataSource.query(postLikesObjectQuery)
  
    const onlyLikeObjects = postLikesObjectArray.filter(likeObject => likeObject.status === "Like" && likeObject.isUserBanned === false)

    const postCountArr = await this.dataSource.query(countQuery);
    const postCount = parseInt(postCountArr[0].count);

    const posts = await this.dataSource.query(query);

    const postsForOutput = posts.map(post => {
      const thisPostLikes = onlyLikeObjects.filter(likeObj => likeObj.postId === post.postId)
    
      const newestLikes = thisPostLikes.slice(0, 3).map(like => {return{
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login
      }})

      let myStatus = "None"
      if(userId){
        const foundLike = postLikesObjectArray.find(postLikeObject => postLikeObject.postId === post.postId && postLikeObject.userId === userId)
        if(foundLike){
          myStatus = foundLike.status
        }
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
          likesCount: parseInt(post.likesCount),
          dislikesCount: parseInt(post.dislikesCount),
            myStatus: myStatus,
            newestLikes: newestLikes
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

  private async getPostLikeObject(userId, postId): Promise<PostLikeDbType | null>{
    const query = `
    SELECT * FROM public."PostLikes"
    WHERE "userId" = $1 AND "postId" = $2    
    ;`
    const result = await this.dataSource.query(query, [userId, postId])
    return result[0]    
}
}
