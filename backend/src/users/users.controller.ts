import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  me(@Req() req: any) {
    return this.usersService.findOne(req.user.sub);
  }

  @Patch()
  update(@Req() req: any, @Body() body: { fullName?: string; title?: string; username?: string }) {
    return this.usersService.update(req.user.sub, body);
  }

  @Delete('workspace')
  leaveWorkspace(@Req() req: any) {
    return this.usersService.leaveWorkspace(req.user.sub, req.user.workspaceId);
  }
}
