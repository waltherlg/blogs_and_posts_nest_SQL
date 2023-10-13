import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './blogs/api/public.blogs.controller';
import { BlogsService } from './blogs/domain/blogs.service';
import { BlogsRepository } from './blogs/infrostracture/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrostracture/blogs.query.repository';
import { CheckService } from './other.services/check.service';
import { PostsRepository } from './posts/posts.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostController } from './posts/api/public.posts.controller';
import { TestingService } from './all.data/test.service';
import { TestingController } from './all.data/testing.controller';
import { UsersService } from './users/users.service';
import { BcryptService } from './other.services/bcrypt.service';
import { UsersRepository } from './users/users.repository';
import { UsersController } from './users/sa.users.controller';
import { UsersQueryRepository } from './users/users.query.repository';
import { AuthService } from './auth/auth.service';
import { DTOFactory } from './helpers/DTO.factory';
import { AuthController } from './auth/auth.controller';
import { EmailManager } from './managers/email-manager';
import { EmailAdapter } from './adapters/email-adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { settings } from './settings';
import { UsersDevicesRepository } from './usersDevices/user.devices.repository';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './auth/strategies/refreshToken.strategy';
import { UsersDeviceService } from './usersDevices/users-devices.service';
import { SecurityController } from './usersDevices/security.controller';
import { AnonymousStrategy } from './auth/strategies/anonymus.strategy';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { CommentsService } from './comments/comments.service';
import { CommentsControllers } from './comments/comments.controller';
import {
  CustomBlogIdValidator,
  CustomUrlValidator,
  LikeStatusValidator,
  TrimNotEmptyValidator,
} from './middlewares/validators';
import { TestRepository } from './all.data/test.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs/dist/cqrs.module';
import { APP_GUARD } from '@nestjs/core';
import { CreateBlogUseCase } from './blogs/application/use-cases/blogger-create-blog-use-case';
import { UpdateBlogByIdFromUriUseCase } from './blogs/application/use-cases/blogger-upadate-blog-using-id-from-uri-use-case';
import { SaBlogsController } from './blogs/api/sa.blogs.controller';
import { BloggerBlogsController } from './blogs/api/blogger.blogs.controller';
import { BindBlogWithUserUseCase } from './blogs/application/use-cases/sa-bind-blog-with-user-use-case';
import { UpdatePostByIdFromBloggerControllerUseCase } from './blogs/application/use-cases/blogger-upadate-post-by-id-from-blogs-controller-use-case';
import { DeleteBlogByIdFromUriUseCase } from './blogs/application/use-cases/blogger-delete-blog-by-id-use-case';
import { CreatePostFromBloggerControllerUseCase } from './blogs/application/use-cases/blogger-create-post-from-blogs-controller-use-case';
import { DeletePostByIdFromUriUseCase } from './blogs/application/use-cases/blogger-delete-post-by-id-use-case';
import { UserBanStatusChangeUseCase } from './users/use-cases/ban-status-change-use-case';
import { BanUserForSpecificBlogUseCase } from './blogs/application/use-cases/blogger-ban-user-for-blog-use-case';

import { BloggerUsersController } from './users/blogger.users.controller';
import { CreateCommentForSpecificPostUseCase } from './posts/use-cases/create-comment-for-specific-post-use-case';
import { SaBanBlogUseCase } from './blogs/application/use-cases/sa-ban-blog-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './typeorm.config';
import { RegisterUserUseCase } from './auth/application/use-cases/register-user-use-case';
import { RegisterationEmailResendingUseCase } from './auth/application/use-cases/registration-email-resendig-use-case';
import { RegisterationConfirmaitonUseCase } from './auth/application/use-cases/registration-confirmation-use-case';
import { TokensService } from './other.services/tokens.service';
import { LoginUseCase } from './auth/application/use-cases/login-use-case';
import { PasswordRecoveryEmailUseCase } from './auth/application/use-cases/password-recovery-via-email-use-case';
import { NewPasswordSetUseCase } from './auth/application/use-cases/new-password-set-use-case';
import { RefreshTokenUseCase } from './auth/application/use-cases/refresh-token-use-case';
import { LogoutUseCase } from './auth/application/use-cases/logout-use-case';
import { CreateUserUseCase } from './users/use-cases/create-user-use-case';
import { UserDevicesQueryRepository } from './usersDevices/user.devices.query.repository';
import { SetLikeStatusForPostUseCase } from './posts/use-cases/set-like-status-for-post-use-case';
import { SetLikeStatusForCommentUseCase } from './comments/application/use-cases/set-like-status-for-comment-use-case';
import { LikesRepository } from './likes/likes.repository';
import { SaCreateBlogUseCase } from './blogs/application/use-cases/sa-create-blog-use-case copy';
import { SaCreatePostFromBloggerControllerUseCase } from './blogs/application/use-cases/sa-create-post-from-blogs-controller-use-case copy';
import { SaUpdatePostByIdUseCase } from './posts/use-cases/sa-upadate-post-by-id-use-case';
import { SaUpdateBlogByIdFromUriUseCase } from './blogs/application/use-cases/sa-upadate-blog-using-id-from-uri-use-case';
import { SaDeleteBlogByIdFromUriUseCase } from './blogs/application/use-cases/sa-delete-blog-by-id-use-case';
import { SaUpdatePostByIdFromBloggerControllerUseCase } from './blogs/application/use-cases/sa-upadate-post-by-id-from-blogs-controller-use-case';
import { SaDeletePostByIdFromUriUseCase } from './blogs/application/use-cases/sa-delete-post-by-id-use-case';
const mongoUri = process.env.MONGO_URL;
const emailUser = process.env.MAIL_USER;
const emailPassword = process.env.MAIL_PASSWORD;
if (!emailUser || !emailPassword) {
  throw new Error('password or user for emailAdapter not found');
}

const useCases = [CreateBlogUseCase, 
  UpdateBlogByIdFromUriUseCase,
  BindBlogWithUserUseCase,
  SaCreatePostFromBloggerControllerUseCase,
UpdatePostByIdFromBloggerControllerUseCase,
SaUpdatePostByIdFromBloggerControllerUseCase,
SaUpdatePostByIdUseCase,
SaUpdateBlogByIdFromUriUseCase,
DeleteBlogByIdFromUriUseCase,
SaDeleteBlogByIdFromUriUseCase,
SaDeletePostByIdFromUriUseCase,
DeletePostByIdFromUriUseCase,
CreateCommentForSpecificPostUseCase,
UserBanStatusChangeUseCase,
BanUserForSpecificBlogUseCase,
SaBanBlogUseCase,
SaCreateBlogUseCase,
RegisterUserUseCase,
RegisterationEmailResendingUseCase,
RegisterationConfirmaitonUseCase,
LoginUseCase,
PasswordRecoveryEmailUseCase,
NewPasswordSetUseCase,
RefreshTokenUseCase,
LogoutUseCase,
CreateUserUseCase,
SetLikeStatusForPostUseCase,
SetLikeStatusForCommentUseCase,]

@Module({
  imports: [
    TypeOrmModule.forRoot(
      typeOrmConfig,
      //autoLoadEntities: true,
    ),
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 600,
      limit: 1000,
    }),
    PassportModule,
    JwtModule.register({
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      },
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [
    AppController,
    BlogsController,
    SaBlogsController,
    BloggerBlogsController,
    BloggerUsersController,
    PostController,
    UsersController,
    AuthController,
    CommentsControllers,
    TestingController,
    SecurityController,
  ],
  providers: [
    AppService,
    BlogsService,
    UsersService,
    UsersDeviceService,
    BcryptService,
    CheckService,
    TestingService,
    AuthService,
    TokensService,
    CommentsService,
    DTOFactory,
    EmailManager,
    EmailAdapter,
    TestRepository,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    UsersRepository,
    UsersQueryRepository,
    UsersDevicesRepository,
    UserDevicesQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
    AnonymousStrategy,
    LikeStatusValidator,
    CustomUrlValidator,
    CustomBlogIdValidator,
    TrimNotEmptyValidator,
    ...useCases,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService],
})
export class AppModule {}
