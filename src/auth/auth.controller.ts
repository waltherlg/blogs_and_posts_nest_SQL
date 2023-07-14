import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputModelType } from '../users/sa.users.controller';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CheckService } from '../other.services/check.service';
import {
  CustomisableException,
  CustomNotFoundException,
  EmailAlreadyExistException,
  LoginAlreadyExistException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StringTrimNotEmpty } from '../middlewares/validators';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { RegisterUserCommand } from './application/use-cases/register-user-use-case';
import { RegisterationEmailResendingCommand } from './application/use-cases/registration-email-resendig-use-case';
import { RegisterationConfirmaitonCommand } from './application/use-cases/registration-confirmation-use-case';
import { LoginCommand } from './application/use-cases/login-use-case';
import { PasswordRecoveryViaEmailCommand } from './application/use-cases/password-recovery-via-email-use-case';
import { NewPasswordSetCommand } from './application/use-cases/new-password-set-use-case';
import { RefreshTokenCommand } from './application/use-cases/refresh-token-use-case';
import { LogoutCommand } from './application/use-cases/logout-use-case';
import { Request, Response } from 'express';
export class RegistrationEmailResendingInput {
  @StringTrimNotEmpty()
  @MaxLength(100)
  @IsEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class PasswordRecoveryEmailInput {
  @StringTrimNotEmpty()
  @MaxLength(100)
  @IsEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class RegistrationConfirmationCodeInput {
  @StringTrimNotEmpty()
  @MaxLength(100)
  code: string;
}

export class newPasswordSetInput {
  @StringTrimNotEmpty()
  @Length(6, 20)
  newPassword: string;
  @StringTrimNotEmpty()
  @MaxLength(100)
  recoveryCode: string;
}
@Throttle(5, 10)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly checkService: CheckService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() userCreateInputModel: CreateUserInputModelType) {
    if (await this.checkService.isEmailExist(userCreateInputModel.email)) {
      throw new EmailAlreadyExistException();
    }
    if (await this.checkService.isLoginExist(userCreateInputModel.login)) {
      throw new LoginAlreadyExistException();
    }
    const newUsersId = await this.commandBus.execute(new RegisterUserCommand(
      userCreateInputModel,)
    );
    const user = await this.usersQueryRepository.getUserById(newUsersId);
    if (!user) {
      throw new UnableException('registration');
    }
    return user;
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(
    @Body() refreshConfirmationDto: RegistrationEmailResendingInput,
  ) {
    if (!(await this.checkService.isEmailExist(refreshConfirmationDto.email))) {
      throw new CustomisableException('email', 'email not exist', 400);
    }
    if (await this.checkService.isEmailConfirmed(refreshConfirmationDto.email)) {
      throw new CustomisableException('email', 'email already confirmed', 400);
    }
    const result = await this.commandBus.execute(new RegisterationEmailResendingCommand(refreshConfirmationDto.email))
    if (!result) {
      throw new CustomisableException(
        'email',
        'the application failed to send an email',
        400,
      );
    }
  }
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationCodeInput,
  ) {
    if(!await this.checkService.isConfirmationCodeExistAndNotExpired(registrationConfirmationDto.code)){
      throw new CustomisableException(
        'code',
        ' confirmation code is incorrect, expired or already been applied',
        400,
      );
    }
    const result = await this.commandBus.execute(new RegisterationConfirmaitonCommand(registrationConfirmationDto.code))
    if(!result){
      throw new CustomisableException(
        'code',
        'the application failed to confirm user',
        400,
      ); 
    }
  }
  //@Throttle(5, 10)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request, @Res({ passthrough: true }) response) {
    
    const { accessToken, refreshToken } = await this.commandBus.execute(new LoginCommand(
      request.user.userId,
      request.ip,
      request.headers['user-agent'] || 'nestApi',
    ));
    if(!{accessToken, refreshToken}){
      throw new UnableException("login", 'Unable login')
    }
    response
      .status(200)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .send({ accessToken });
  }
  //current user info
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async currentUserInfo(@Req() request) {
    const currentUserInfo = await this.usersQueryRepository.getCurrentUserInfo(
      request.user.userId,
    );
    if (!currentUserInfo) {
      throw new UnableException('get current user info');
    }
    return currentUserInfo;
  }
  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Req() request, @Res({ passthrough: true }) response) {
    const { accessToken, refreshToken } =
      await this.commandBus.execute(new RefreshTokenCommand(
        request.user.userId,
        request.user.deviceId,
      ));
    response
      .status(200)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .send({ accessToken });
  }

  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryEmailInput) {
    if (!(await this.checkService.isEmailExist(passwordRecoveryDto.email))) {
      throw new CustomNotFoundException('email');
    }
    const result = await this.commandBus.execute(new PasswordRecoveryViaEmailCommand(passwordRecoveryDto));
    if (!result) {
      throw new UnableException('password recovery');
    }
  }

  @Post('new-password')
  @HttpCode(204)
  async newPasswordSet(@Body() newPasswordDTO: newPasswordSetInput) {
    if (
      !(await this.checkService.isPasswordRecoveryCodeExistAndNotExpired(
        newPasswordDTO.recoveryCode,
      ))
    ) {
      throw new CustomisableException(
        'recoveryCode',
        'recovery code incorrect, or expired',
        400,
      );
    }
    const result: boolean = await this.commandBus.execute(new NewPasswordSetCommand(newPasswordDTO));
       if (!result) {
      throw new UnableException('password change');
    }
  }
  @SkipThrottle()
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  //@HttpCode(204)
  async logout(@Req() request, @Res() response: Response) {
    const isLogout = await this.commandBus.execute(new LogoutCommand(request.user));
    if (isLogout) {
        return response.cookie('refreshToken', '').status(204).send()
    } else {
      throw new CustomisableException('logout', 'logout error', 400);
    }    
  }
}
