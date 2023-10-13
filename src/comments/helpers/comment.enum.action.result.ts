import { ForbiddenException } from "@nestjs/common";
import { CustomNotFoundException, CustomisableException } from "../../exceptions/custom.exceptions";

export enum CommentActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserNotFound = 'USER_NOT_FOUND',
    PostNotFound = 'POST_NOT_FOUND',
    CommentNotFound = 'COMMENT_NOT_FOUND',
    UserBannedForBlog = 'USER_BANNED_FOR_BLOG',
    NoChangeNeeded = 'NO_CHANGE_NEEDED',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',
    NotSaved = 'CHANGES_NOT_SAVED',   
    NotCreated = 'NOT_CREATED', 
    NotDeleted = 'NOT_DELETED', 
  }

  export function handleCommentActionResult(result: CommentActionResult) {
    if (!Object.values(CommentActionResult).includes(result)) {
      return;
    }
    switch (result) {
      case CommentActionResult.Success:
        break;
      case CommentActionResult.NoChangeNeeded:
        break;
      case CommentActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case CommentActionResult.PostNotFound:
        throw new CustomNotFoundException('post') 
      case CommentActionResult.UserNotFound:
        throw new CustomNotFoundException('user')  
      case CommentActionResult.CommentNotFound:
        throw new CustomNotFoundException('comment') 

      case CommentActionResult.NotOwner:
        throw new CustomisableException('not owner', 'users cannot change data unless they are the owner', 403)

      case CommentActionResult.UserBannedForBlog:
        throw new ForbiddenException('banned user can\'t add comment')  

      case CommentActionResult.NotCreated:
        throw new CustomisableException('can\'t create', 'failed to create new doccument', 500) 
      case CommentActionResult.NotSaved:
        throw new CustomisableException('can\'t save', 'failed to save changes', 500)  
      case CommentActionResult.NotDeleted:
        throw new CustomisableException('can\'t delete', 'failed to delete', 500) 
        
      
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }