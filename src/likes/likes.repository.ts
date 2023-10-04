import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';
import { CommentLikeDbType, PostLikeDbType } from "./db.likes.types";


@Injectable()
export class LikesRepository {
    constructor(@InjectDataSource() protected dataSource: DataSource)
{}

async getPostLikeObject(userId, postId): Promise<PostLikeDbType | null>{
    const query = `
    SELECT * FROM public."PostLikes"
    WHERE "userId" = $1 AND "postId" = $2    
    ;`
    const result = await this.dataSource.query(query, [userId, postId])
    return result[0]    
}

async addPostLikeStatus(postLikeDto: PostLikeDbType){
    const query = `
    INSERT INTO public."PostLikes"(
        "postId",
        "addedAt",
        "userId",
        "login",
        "isUserBanned",
        "status")
        VALUES (
            $1,  
            $2, 
            $3, 
            $4, 
            $5, 
            $6)
        RETURNING "postId";
    `;
    const result = await this.dataSource.query(query, [
        postLikeDto.postId,
        postLikeDto.addedAt,
        postLikeDto.userId,
 -      postLikeDto.login,
        postLikeDto.isUserBanned,
        postLikeDto.status
    ])
    const postId = result[0].postId
    if (postId){
        return true
    } else {
        return false
    }
}

async updatePostLike(postId, userId, status): Promise<boolean>{
    const query = `
    UPDATE public."PostLikes"
    SET status = $3
    WHERE "postId" = $1 AND "userId" = $2
    `;
    const result = await this.dataSource.query(query, [postId, userId, status])
    const count = result[1]
    return count === 1
}

async addCommentLikeStatus(commentLikeDto: CommentLikeDbType){
    const query = `
    INSERT INTO public."CommentLikes"(
        "commentId",
        "addedAt",
        "userId",
        "login",
        "isUserBanned",
        "status")
        VALUES (
            $1,  
            $2, 
            $3, 
            $4, 
            $5, 
            $6)
        RETURNING "commentId";
    `;
    const result = await this.dataSource.query(query, [
        commentLikeDto.commentId,
        commentLikeDto.addedAt,
        commentLikeDto.userId,
 -      commentLikeDto.login,
        commentLikeDto.isUserBanned,
        commentLikeDto.status
    ])
    const commentId = result[0].commentId
    if (commentId){
        return true
    } else {
        return false
    }
}

async updateCommentLike(commentId, userId, status): Promise<boolean>{
    const query = `
    UPDATE public."CommentLikes"
    SET status = $3
    WHERE "commentId" = $1 AND "userId" = $2
    `;
    const result = await this.dataSource.query(query, [commentId, userId, status])
    const count = result[1]
    return count === 1
}

async getCommentLikeObject(userId, commentId): Promise<CommentLikeDbType | null>{
    const query = `
    SELECT * FROM public."CommentLikes"
    WHERE "userId" = $1 AND "commentId" = $2    
    ;`
    const result = await this.dataSource.query(query, [userId, commentId])
    return result[0]    
}



}