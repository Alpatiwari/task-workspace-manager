import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  body: string;
}

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findForTask(@Param('taskId') taskId: string) {
    return this.commentsService.findForTask(taskId);
  }

  @Post()
  create(@Req() req: any, @Param('taskId') taskId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(taskId, req.user.sub, dto.body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
