import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { CheckService } from '../other.services/check.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import {
  BlogNotFoundException,
  CustomisableException,
  CustomNotFoundException,
  UnableException,
} from '../exceptions/custom.exceptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  IsString,
  Length,
  Validate,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import {
  LikeStatusValidator,
  StringTrimNotEmpty,
} from '../middlewares/validators';
import { SetLikeStatusForCommentCommand } from './application/use-cases/set-like-status-for-comment-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { handleCommentActionResult } from './helpers/comment.enum.action.result';

export class UpdateCommentInputModelType {
  @StringTrimNotEmpty()
  @Length(20, 300)
  content: string;
}
export class SetLikeStatusForCommentInputModel {
  @StringTrimNotEmpty()
  @Validate(LikeStatusValidator)
  likeStatus: string;
}

@Controller('comments')
export class CommentsControllers {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly checkService: CheckService,
    private readonly commandBus: CommandBus,
  ) {}
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getCommentById(@Req() request, @Param('id') commentId: string) { // TODO: findout status 500
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      request.user.userId, //user = userId
    );
    if (!comment) {
      throw new CustomNotFoundException('comment');
    }
    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteCommentById(@Req() request, @Param('id') commentId: string) {
    if (!(await this.checkService.isCommentExist(commentId))) {
      throw new CustomNotFoundException('comment');
    }
    if (
      !(await this.checkService.isUserOwnerOfComment(request.user.userId, commentId))
    ) {
      throw new CustomisableException(
        'user is not owner',
        'cannot delete comments if you are not owner',
        403,
      );
    }
    const isCommentDeleted = await this.commentsService.deleteCommentById(
      commentId,
    );
    if (!isCommentDeleted) {
      throw new UnableException('comment deleting');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentById(
    @Req() request,
    @Param('id') commentId: string,
    @Body() updateDTO: UpdateCommentInputModelType,
  ) {
    if (!(await this.checkService.isCommentExist(commentId))) {
      throw new CustomNotFoundException('comment');
    }
    if (
      !(await this.checkService.isUserOwnerOfComment(request.user.userId, commentId))
    ) {
      throw new CustomisableException(
        'user is not owner',
        'cannot delete comments if you are not owner',
        403,
      );
    }
    const isUpdated = await this.commentsService.updateCommentById(
      commentId,
      updateDTO.content,
    );
    if (!isUpdated) {
      throw new UnableException('comment update');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatusForComment( // TODO: if :id from uri param not found need status 404, not 400... need check
    @Req() request,
    @Param('id') commentId: string,
    @Body(new ValidationPipe({ transform: true }))
    likeStatus: SetLikeStatusForCommentInputModel,
  ) {
    
    const result = await this.commandBus.execute(new SetLikeStatusForCommentCommand(request.user.userId, commentId, likeStatus.likeStatus))
    handleCommentActionResult(result)
  }
}
