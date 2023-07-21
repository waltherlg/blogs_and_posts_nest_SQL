import { Body, Controller, HttpCode, Param, Put, Query, Req, UseGuards, Get, } from "@nestjs/common"
import { CommandBus } from "@nestjs/cqrs"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { BanUserForBlogInputModelType } from "src/blogs/api/blogger.blogs.controller"
import { BanUserForSpecificBlogCommand } from "src/blogs/application/use-cases/blogger-ban-user-for-blog-use-case"
import { handleBlogOperationResult } from "src/blogs/helpers/blogs.enum.action.result"
import { BlogsQueryRepository } from "src/blogs/infrostracture/blogs.query.repository"
import { BlogsRepository } from "src/blogs/infrostracture/blogs.repository"
import { RequestBannedUsersQueryModel, DEFAULT_BANNED_USERS_QUERY_PARAMS } from "src/models/types"
import { UsersQueryRepository } from "./users.query.repository"
import { CheckService } from "src/other.services/check.service"
import { CustomNotFoundException, CustomisableException } from "src/exceptions/custom.exceptions"


@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly checkService: CheckService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Put(':bannedUserId/ban')
  @HttpCode(204)
  async banUserForBlog(@Req() request, @Param('bannedUserId') bannedUserId: string, @Body() banUserDto: BanUserForBlogInputModelType ){
    const result = await this.commandBus.execute(new BanUserForSpecificBlogCommand(request.user.userId, bannedUserId, banUserDto))
    handleBlogOperationResult(result)
  }

  @Get('blog/:blogId')
  @HttpCode(200)
  async getBannedUsersForCurrentBlog(@Req() request, @Param('blogId') blogId: string, @Query() queryParams: RequestBannedUsersQueryModel){
    if(!await this.checkService.isBlogExist(blogId)){
      throw new CustomNotFoundException('blog')
    }
    if(!await this.checkService.isUserOwnerOfBlog(request.user.userId, blogId)){
      throw new CustomisableException('blogId', 'you are not owner of this blog', 403)
    }
    const mergedQueryParams = { ...DEFAULT_BANNED_USERS_QUERY_PARAMS, ...queryParams }
    return await this.usersQueryRepository.getBannedUsersForCurrentBlog(blogId, mergedQueryParams)
  }
}