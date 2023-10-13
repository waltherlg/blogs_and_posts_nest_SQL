import { BlogsRepository } from '../../infrostracture/blogs.repository';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces';
import { BlogActionResult } from '../../helpers/blogs.enum.action.result';
import { BanUserForBlogInputModelType } from '../../../blogs/api/blogger.blogs.controller';
import { BannedBlogUsersType } from '../../../blogs/blogs.types';
import { UsersRepository } from '../../../users/users.repository';
import { CheckService } from '../../../other.services/check.service';

export class BanUserForSpecificBlogCommand {
  constructor(public bloggerId: string, public bannedUserId: string,
    public banUserDto: BanUserForBlogInputModelType){}
}

@CommandHandler(BanUserForSpecificBlogCommand)
export class BanUserForSpecificBlogUseCase implements ICommandHandler<BanUserForSpecificBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository, 
              private readonly usersRepository: UsersRepository,
              private readonly checkService: CheckService) {}

  async execute(
    command: BanUserForSpecificBlogCommand,
  ): Promise<BlogActionResult> {

    const bloggerId = command.bloggerId
    const bannedUserId = command.bannedUserId
    const banStatus = command.banUserDto.isBanned
    const banReason = command.banUserDto.banReason
    const blogId = command.banUserDto.blogId

    const blog = await this.blogsRepository.getBlogDBTypeById(blogId);
    
    if(!blog) return BlogActionResult.BlogNotFound

    if(blog.userId !== bloggerId) return BlogActionResult.NotOwner

    const user = await this.usersRepository.getUserDBTypeById(bannedUserId)
    if(!user){
      return BlogActionResult.UserNotFound
    }

    if(banStatus === true){

      if(await this.checkService.isUserBannedForBlog(blogId, bannedUserId)){
        return BlogActionResult.UserAlreadyBanned
      }

      const banUserInfo: BannedBlogUsersType = {
        blogId: blogId,
        bannedUserId: bannedUserId,
        banDate: new Date().toISOString(),
        banReason: banReason,
      }

      const result = await this.blogsRepository.addUserToBlogBanList(banUserInfo)
      if (result){
        return BlogActionResult.Success
      } else {
        return BlogActionResult.NotSaved
      }
    }

    if(banStatus === false){
      if (!await this.checkService.isUserBannedForBlog(blogId, bannedUserId)) {
        return BlogActionResult.UserNotBanned
      }
      const result = await this.blogsRepository.removeUserFromBlogBanList(blogId, bannedUserId) 
      if (result){
        return BlogActionResult.Success
      } else {
        return BlogActionResult.NotSaved
      }
    }
  }
}
