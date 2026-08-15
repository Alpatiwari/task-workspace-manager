import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Guest login: creates a throwaway user + a personal workspace,
   * no email/password required. Matches the "Continue as Guest" button in Figma.
   */
  async guestLogin(dto: GuestLoginDto) {
    const suffix = uuid().slice(0, 6);
    const user = await this.prisma.user.create({
      data: {
        isGuest: true,
        fullName: dto.displayName?.trim() || `Guest ${suffix}`,
        username: `guest_${suffix}`,
      },
    });

    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${user.fullName}'s Workspace`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'owner' } },
      },
    });

    return this.issueToken(user.id, workspace.id, { fullName: user.fullName, isGuest: true });
  }

  /**
   * Google login stub. Wire this up to a real Google OAuth flow
   * (e.g. @nestjs/passport + passport-google-oauth20) once you have
   * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in your .env.
   * For now it accepts a verified Google profile object from the frontend
   * (e.g. via NextAuth on the client) and finds-or-creates the user.
   */
  async googleLogin(profile: { email: string; name?: string; avatarUrl?: string }) {
    if (!profile?.email) {
      throw new UnauthorizedException('Google profile missing email');
    }

    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.name || profile.email.split('@')[0],
          avatarUrl: profile.avatarUrl,
          isGuest: false,
        },
      });
    }

    let membership = await this.prisma.workspaceMember.findFirst({ where: { userId: user.id } });
    let workspaceId = membership?.workspaceId;

    if (!workspaceId) {
      const workspace = await this.prisma.workspace.create({
        data: {
          name: `${user.fullName}'s Workspace`,
          ownerId: user.id,
          members: { create: { userId: user.id, role: 'owner' } },
        },
      });
      workspaceId = workspace.id;
    }

    return this.issueToken(user.id, workspaceId, { fullName: user.fullName, isGuest: false });
  }

  private issueToken(userId: string, workspaceId: string, extra: Record<string, any>) {
    const payload = { sub: userId, workspaceId, ...extra };
    return {
      accessToken: this.jwt.sign(payload),
      user: payload,
    };
  }
}
