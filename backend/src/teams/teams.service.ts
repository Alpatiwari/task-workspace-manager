import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(workspaceId: string) {
    return this.prisma.team.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(workspaceId: string, dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: { workspaceId, name: dto.name },
    });
  }
}