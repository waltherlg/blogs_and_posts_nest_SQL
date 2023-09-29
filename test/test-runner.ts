import { testSaUsersCrud } from './00-0-sa.users.e2e-spec';
import { testSaUsersGetWithPagination } from './00-1-sa.get-users-pagenations.e2e-spec';
import { testBlogCrud } from './w-blogs.e2e-spec';
import { testPostCrud } from './w-posts.e2e-spec';
import { testSecurityDevices } from './01-01-security-devices.e2e-spec';
import { testCommentsCrud } from './w-comments.e2e-spec';
import { testAuthOperations } from './03-00-auth.(integration).test';
import { testAuthValidations } from './03-01-auth.validations.e2e-spec';
import { testBloggerCrudOnlyBlogs } from './05-00-blogger.blogs.controller';
import { testPostLikesCrud } from './08-post-likes.operation.e2e-spec';
import { testCommentLikesCrud } from './09-comments-likes.operation.e2e-spec';
import { bloggerUsersControllers } from './11-blogger.usrers.controller.e2e-spec';
import { saBlogsControllerCrudAndBan } from './06-sa.blogs.controller.e2e-spec';
import { testBanUserForBlogByBlogger } from './05-01-blogger.users.ban.check-e2e-spec';
import { postCrudOperations } from './07-00-post.CRUD.e2e-spec copy 2';
import { commentCrudOperations } from './09-00-public.comments.controller.e2e-spec copy';
import { saCommentCrudOperations } from './09-00-sa-and-public.comments.controller.e2e-spec copy 2';

describe('End-to-End Tests', () => {
  //testSaUsersCrud()
  //testSaUsersGetWithPagination()
  //testSecurityDevices()
  //testAuthOperations()
  //testAuthValidations()
  //testBloggerCrudOnlyBlogs()
  //testBanUserForBlogByBlogger()
  //saBlogsControllerCrudAndBan()
  //postCrudOperations()
  //testPostLikesCrud()
  //commentCrudOperations() // this comment CRUD if blog create blogger
  //saCommentCrudOperations()
  
  testCommentLikesCrud()
  //banCheckOperation()

  //bloggerUsersControllers()
});
