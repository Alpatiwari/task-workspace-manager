import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const taskInclude = {
  members: { include: { user: true } },
  labels: { include: { label: true } },
  reporter: true,
  subtasks: true,
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' as const } },
  activity: { include: { actor: true }, orderBy: { createdAt: 'desc' as const } },
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /** List top-level tasks (subtasks are nested via parentTaskId, not top-level) for a workspace. */
  findAll(workspaceId: string, projectId?: string) {
    return this.prisma.task.findMany({
      where: { workspaceId, projectId, parentTaskId: null },
      include: taskInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(workspaceId: string, reporterId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        workspaceId,
        reporterId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        members: dto.memberIds
          ? { create: dto.memberIds.map((userId) => ({ userId })) }
          : undefined,
        labels: dto.labelIds
          ? { create: dto.labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: taskInclude,
    });
  }

  async update(id: string, actorId: string, dto: UpdateTaskDto) {
    const existing = await this.findOne(id);

    // Log status/priority changes for the activity feed shown in the task panel.
    if (dto.status && dto.status !== existing.status) {
      await this.prisma.activityLog.create({
        data: { taskId: id, actorId, action: `changed status from ${existing.status} to ${dto.status}` },
      });
    }
    if (dto.priority && dto.priority !== existing.priority) {
      await this.prisma.activityLog.create({
        data: { taskId: id, actorId, action: `changed priority from ${existing.priority} to ${dto.priority}` },
      });
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        projectId: dto.projectId,
      },
      include: taskInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}
