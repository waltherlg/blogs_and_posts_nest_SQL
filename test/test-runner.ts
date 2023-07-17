import { testSaUsersCrud } from './00-0-sa.users.e2e-spec';
import { testSaUsersGetWithPagination } from './00-1-sa.get-users-pagenations.e2e-spec';
import { testBlogCrud } from './01-blogs.e2e-spec';
import { testPostCrud } from './02-posts.e2e-spec';
import { testSecurityDevices } from './04-01-security-devices.e2e-spec';
import { testCommentsCrud } from './04-comments.e2e-spec';
import { testAuthOperations } from './05-00-auth.(integration).test';
import { testAuthValidations } from './05-01-auth.validations.e2e-spec';
import { testBloggerCrud } from './07-blogger.blogs.controller';
import { testPostLikesCrud } from './08-post-likes.operation.e2e-spec';
import { testCommentLikesCrud } from './09-comments-likes.operation.e2e-spec';
import { banCheckOperation } from './10-ban.check.operation.e2e-spec';
import { bloggerUsersControllers } from './11-blogger.usrers.controller.e2e-spec';

describe('End-to-End Tests', () => {
  //testSaUsersCrud()
  //testSaUsersGetWithPagination()
  testBloggerCrud()
  //testPostLikesCrud()
  //testSecurityDevices()
  //testCommentLikesCrud()
  //banCheckOperation()
  //testAuthOperations()
  //testAuthValidations()
  //bloggerUsersControllers()
});
