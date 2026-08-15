import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  findForTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(taskId: string, authorId: string, body: string) {
    const comment = await this.prisma.comment.create({
      data: { taskId, authorId, body },
      include: { author: true },
    });
    await this.prisma.activityLog.create({
      data: { taskId, actorId: authorId, action: 'posted a comment' },
    });
    return comment;
  }

  remove(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
