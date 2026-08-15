import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: { fullName?: string; title?: string; username?: string; avatarUrl?: string }) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data });
  }

  async leaveWorkspace(userId: string, workspaceId: string) {
    return this.prisma.workspaceMember.deleteMany({ where: { userId, workspaceId } });
  }
}
