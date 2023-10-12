import { CommentsRepository } from '../../comments/comments.repository';
import { BlogsRepository } from 'src/blogs/infrostracture/blogs.repository';
import { UsersRepository } from '../users.repository';
import { Injectable } from "@nestjs/common";
import { PostsRepository } from 'src/posts/posts.repository';
import { UsersDevicesRepository } from 'src/usersDevices/user.devices.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../sa.users.controller';


export class UserBanStatusChangeCommand {
    constructor(public userId, public banDto: BanUserInputModel){}
}

@CommandHandler(UserBanStatusChangeCommand)
export class UserBanStatusChangeUseCase implements ICommandHandler<UserBanStatusChangeCommand>{
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly usersDevicesRepository: UsersDevicesRepository){}

        async execute(command: UserBanStatusChangeCommand): Promise<boolean>{

            const userId = command.userId
            const newBanStatus = command.banDto.isBanned
            const banReason = command.banDto.banReason

            const isUserAlreadyBanned = await this.usersRepository.isUserBanned(command.userId)
            
            if(isUserAlreadyBanned === newBanStatus){
                return
            }
            const userBanDto = {
                userId: userId,
                isBanned: false,
                banReason: null,
                banDate: null,
            }
            if(newBanStatus === true){
                userBanDto.isBanned = true
                userBanDto.banReason = banReason
                userBanDto.banDate = new Date()
                await this.usersDevicesRepository.deleteAllUserDevicesById(userId)
            }
        
          const isBanStatusChanged = await this.usersRepository.changeUserBanStatus(userBanDto)
          return isBanStatusChanged          
        }
}