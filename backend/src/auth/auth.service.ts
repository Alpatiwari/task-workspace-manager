import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
  }

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
   * Real Google login. Takes the ID token produced by Google Identity
   * Services on the frontend (the official "Sign in with Google" button),
   * and verifies it server-side against GOOGLE_CLIENT_ID before trusting
   * anything in it. This is what makes it safe — the frontend can't just
   * claim to be any email address, since the token is cryptographically
   * signed by Google and checked here.
   */
  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new UnauthorizedException('Missing Google ID token');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Google token missing email');
    }

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          fullName: payload.name || payload.email.split('@')[0],
          avatarUrl: payload.picture,
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