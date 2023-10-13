import { CommentTypeOutput } from './comments.types';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';
import { CommentLikeDbType } from '../likes/db.likes.types';
@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}
  async getCommentById(commentId: string, userId?: string): Promise<CommentTypeOutput | null> {
    if (!isValidUUID(commentId)) {
      return null;
    }
    const query = `
      SELECT "Comments".*, "Users"."login", "Users"."isUserBanned"
      FROM public."Comments" 
      INNER JOIN "Users" ON "Comments"."userId" = "Users"."userId"
      WHERE "commentId" = $1 AND "isUserBanned" = false; 
    `;
    const result = await this.dataSource.query(query, [commentId]);
    const comment = result[0];
    if(!comment){
      return null
    }
    let myStatus = "None"
    
    if(userId){
          const myStatusQuery = `
          SELECT "status" 
          FROM public."CommentLikes"
          WHERE "commentId" = $1 AND "userId" = $2
          `;
          const result = await this.dataSource.query(myStatusQuery, [commentId, userId]);
          
          if(result[0]){
            myStatus = result[0].status
          }
    } 

    return {
      id: comment.commentId,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: parseInt(comment.likesCount),
        dislikesCount: parseInt(comment.dislikesCount),
        myStatus: myStatus
      }  
    }
  }

  async getAllCommentsByPostId(postId: string, mergedQueryParams, userId?) {  

    const sortBy = mergedQueryParams.sortBy;
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = mergedQueryParams.pageNumber;
    const pageSize = mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
      postId,
    ];

    let query = `
    SELECT "Comments".*, "Users".login, "Users"."isUserBanned", "Blogs"."isBlogBanned"
    FROM public."Comments"
    INNER JOIN "Users" ON "Comments"."userId" = "Users"."userId"
    INNER JOIN "Posts" ON "Comments"."postId" = "Posts"."postId"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Users"."isUserBanned" = false AND "Blogs"."isBlogBanned" = false AND "Comments"."postId" = '${queryParams[5]}'
    `
    
    let countQuery = `
    SELECT COUNT(*) as "count"
    FROM public."Comments"
    INNER JOIN "Users" ON "Comments"."userId" = "Users"."userId"
    INNER JOIN "Posts" ON "Comments"."postId" = "Posts"."postId"
    INNER JOIN "Blogs" ON "Posts"."blogId" = "Blogs"."blogId"
    WHERE "Users"."isUserBanned" = false AND "Blogs"."isBlogBanned" = false AND "Comments"."postId" = '${queryParams[5]}'
    `
    query += ` ORDER BY "${queryParams[0]}" ${queryParams[1]}
    LIMIT ${queryParams[3]} OFFSET ${queryParams[4]};
    `;

    const commentCountArr = await this.dataSource.query(countQuery);
    
    const commentCount = parseInt(commentCountArr[0].count);
  
    const comments = await this.dataSource.query(query);
 
    
    let usersLikeObjectsForThisComments
    if(userId){
      //если пришел userId то нужно узнать его лайкстатус для каждого коммента

      //нужен массив из айдишек комментов, которые вернул основной запрос

      const arrayOfCommentsId = comments.map(comment => { return comment.commentId })
      
      // нужно найти все лайки где есть айди пользователя и коммент айди из массива выше
      const usersLikeObjectsQuery = `
      SELECT *
      FROM public."CommentLikes"
      WHERE "userId" = '${userId}' AND "commentId" = ANY(ARRAY[${arrayOfCommentsId.map(id => `'${id}'`).join(',')}]::uuid[])
      `
      // нужно подробно разобраться как эта хрень работает
      
      usersLikeObjectsForThisComments = await this.dataSource.query(usersLikeObjectsQuery)
      
    }

    const commentsForOutput: CommentTypeOutput = comments.map(comment => {
      let myStatus = "None"
          if(userId){
            const foundLike = usersLikeObjectsForThisComments.find(commentLikeObject => commentLikeObject.commentId === comment.commentId)
            if(foundLike){
              myStatus = foundLike.status
            }
          }
      return {
        id: comment.commentId,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.login,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: parseInt(comment.likesCount),
          dislikesCount: parseInt(comment.dislikesCount),
          myStatus: myStatus
        }
      }
    })

    const pageCount = Math.ceil(commentCount / pageSize);

    const outputComments = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: commentCount,
      items: commentsForOutput
    };
    return outputComments;


  }


  // async getAllCommentsForBlogger(mergedQueryParams, userId){ // it is mongoose
  //   const sortBy = mergedQueryParams.sortBy;
  //   const sortDirection = mergedQueryParams.sortDirection;
  //   const pageNumber = mergedQueryParams.pageNumber;
  //   const pageSize = mergedQueryParams.pageSize;

  //   const posts = await this.postModel.find({userId: userId})

  //   const postIds = posts.map(post => post._id.toString());

  //   const commentsCount = await this.commentModel.countDocuments({ postId: { $in: postIds } })
  //   const comments = await this.commentModel.find({ postId: { $in: postIds } })
  //   .sort({ [sortBy]: this.sortByDesc(sortDirection) })
  //   .skip(this.skipPage(pageNumber, pageSize))
  //   .limit(+pageSize);

  //   const commentsForOutput = comments.map((comment: CommentDocument) => {
  //       const currentPostIndex = posts.findIndex(post => post._id.toString() === comment.postId)
  //       const currentPost = posts[currentPostIndex]
  //       const LikesAndDislikes = comment.countLikesAndDislikes()
 
  //     return {
  //       id: comment._id.toString(),
  //       content: comment.content,
  //       createdAt: comment.createdAt,
  //       commentatorInfo: {
  //         userId: comment.userId,
  //         userLogin: comment.userLogin,
  //       },
  //       likesInfo: {
  //         likesCount : LikesAndDislikes.likesCount,
  //         dislikesCount : LikesAndDislikes.dislikesCount,
  //         myStatus :"None"},
        
  //       postInfo: {
  //         id: comment.postId,
  //         title: currentPost.title,
  //         blogId: currentPost.blogId,
  //         blogName: currentPost.blogName
  //       }

  //     };
  //   })
  //   const pageCount = Math.ceil(commentsCount / +pageSize);

  //   const outputComments = {
  //     pagesCount: pageCount,
  //     page: +pageNumber,
  //     pageSize: +pageSize,
  //     totalCount: commentsCount,
  //     items: commentsForOutput,
  //   };
  //   return outputComments;
    

  // }
  
  // sortByDesc(sortDirection: string) {
  //   return sortDirection === 'desc' ? -1 : 1;
  // }

  // skipPage(pageNumber: string, pageSize: string): number {
  //   return (+pageNumber - 1) * +pageSize;
  // }

  async getCommentLikeObject(userId, postId): Promise<CommentLikeDbType | null>{
    const query = `
    SELECT * FROM public."CommentLikes"
    WHERE "userId" = $1 AND "commentId" = $2    
    ;`
    const result = await this.dataSource.query(query, [userId, postId])
    return result[0]    
}
}
