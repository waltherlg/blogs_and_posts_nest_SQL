import { CustomNotFoundException, CustomisableException } from "../../exceptions/custom.exceptions";

export enum UserActionResult {
    Success = 'SUCCESS',
    BlogNotFound = 'BLOG_NOT_FOUND',
    UserNotFound = 'USER_NOT_FOUND',
    PostNotFound = 'POST_NOT_FOUND',
    NotOwner = 'CURRENT_USER_IS_NOT_OWNER',
    NoChangeNeeded = 'NO_CHANGE_NEEDED',
    UserAlreadyBound = 'USER_ALREADY_BOUND',
    UserAlreadyBanned = 'USER_ALREADY_BANNED',
    UserNotBanned = 'USER_NOT_BANNED',
    NotSaved = 'CHANGES_NOT_SAVED',   
    NotCreated = 'NOT_CREATED', 
    NotDeleted = 'NOT_DELETED', 
  }

  export function handleUserActionResult(result: UserActionResult) {
    if (!Object.values(UserActionResult).includes(result)) {
      return;
    }
    switch (result) {
      case UserActionResult.Success:
        break;
      case UserActionResult.UserAlreadyBanned:
        break;
      case UserActionResult.UserNotBanned:
        break;
      case UserActionResult.NoChangeNeeded:
        break;
      case UserActionResult.BlogNotFound:
        throw new CustomNotFoundException('blog')
      case UserActionResult.PostNotFound:
        throw new CustomNotFoundException('post') 
      case UserActionResult.UserNotFound:
        throw new CustomNotFoundException('user')  
      case UserActionResult.UserAlreadyBound:
        throw new CustomisableException('blogId', 'current blog already bound', 400)
      case UserActionResult.UserNotFound:
        throw new CustomNotFoundException('user')
      case UserActionResult.NotSaved:
        throw new CustomisableException('can\'t save', 'failed to save changes', 500)
      case UserActionResult.NotOwner:
        throw new CustomisableException('not owner', 'users cannot change data unless they are the owner', 403)
      case UserActionResult.NotCreated:
        throw new CustomisableException('can\'t create', 'failed to create new doccument', 500)  
      case UserActionResult.NotDeleted:
        throw new CustomisableException('can\'t delete', 'failed to delete this doccument', 500)  
      
      default:
        throw new CustomisableException('unexpected', 'An unexpected error occurred', 400)       
    }
  }