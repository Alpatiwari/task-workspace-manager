import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.teamsService.findAll(req.user.workspaceId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(req.user.workspaceId, dto);
  }
}