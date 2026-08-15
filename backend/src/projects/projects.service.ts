import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: { lead: true, tasks: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { lead: true, tasks: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(workspaceId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        workspaceId,
        title: dto.title,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { lead: true },
    });
  }

  async update(id: string, dto: Partial<CreateProjectDto>) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}
