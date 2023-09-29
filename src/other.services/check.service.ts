import { BlogsRepository } from '../blogs/infrostracture/blogs.repository';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { UsersDevicesRepository } from '../usersDevices/user.devices.repository';
@Injectable()
export class CheckService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersDeviceRepository: UsersDevicesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async isBlogExist(blogId): Promise<boolean> {
    const isExist = await this.blogsRepository.isBlogExist(blogId);
    return isExist;
  }

  async isPostExist(postId): Promise<boolean> {
    const post = await this.postsRepository.isPostExist(postId);
    return !!post;
  }

  async isUserIdExist(userId): Promise<boolean> {
    const user = await this.usersRepository.isUserIdExist(userId);
    return !!user;
  }

  async isConfirmationCodeExistAndNotExpired(code: string): Promise<boolean> {
    const isValid = await this.usersRepository.isConfirmationCodeExistAndNotExpired(code);
    return !!isValid;
  }

  async isEmailConfirmed(email: string): Promise<boolean> {
    const isConfirmed = await this.usersRepository.isEmailAlreadyCofirmed(email);
    return isConfirmed;
  }

  async isEmailExist(email: string): Promise<boolean> {
    const emailExist = await this.usersRepository.isEmailExists(email);
    return !!emailExist;
  }

  async isLoginExist(login: string): Promise<boolean> {
    const isLoginExist = await this.usersRepository.isLoginExists(login);
   
    return isLoginExist;
  }

  async isPasswordRecoveryCodeExistAndNotExpired(code: string): Promise<boolean> {
    const isExist = await this.usersRepository.isPasswordRecoveryCodeExistAndNotExpired(
      code,
    );
    return !!isExist;
  }

  async isCommentExist(commentId): Promise<boolean> {
    const isExist = await this.commentsRepository.isCommentExist(
      commentId,
    );
    return !!isExist;
  }
  
  async isUserOwnerOfComment(userId, commentId): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentDbTypeById(
      commentId,
    );
    if (!comment || comment.userId !== userId) {
      return false;
    } else return true;
  }

  async isUserOwnerOfDevice(userId, deviceId): Promise<boolean> {
    const result = await this.usersDeviceRepository.getDeviceByUsersAndDeviceId(
      userId,
      deviceId,
    );
    return !!result;
  }

  async isUserDeviceExist(deviceId): Promise<boolean> {
    const userDevice = await this.usersDeviceRepository.isUserDeviceExist(
      deviceId,
    );
    return !!userDevice;
  }

  async isUserOwnerOfBlog(userId, blogId): Promise<boolean>{
    const blog = await this.blogsRepository.getBlogDBTypeById(blogId)
    if (!blog || blog.userId !== userId) {
      return false 
    } else {
      return true
    }
  }

  async isUserBanned(userId: string): Promise<boolean>{
    const isUserBanned = await this.usersRepository.isUserBanned(userId)
    return isUserBanned
  }

  async isUserBannedForBlog(blogId, userId){
    const isUserBanned = await this.blogsRepository.isUserBannedForBlog(blogId, userId)
    return isUserBanned
  }
}
