import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get session information
   */
  async getSession(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select:  {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            isAdmin: true,
            paymentVerified: true,
            walletBalance: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session. expires < new Date()) {
      await this. deleteSession(sessionToken);
      return null;
    }

    return {
      user: {
        ... session.user,
        walletBalance: Number(session.user.walletBalance),
      },
      expires: session.expires,
    };
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(sessionToken: string) {
    await this.prisma. session.delete({
      where: { sessionToken },
    });

    return { success: true };
  }

  /**
   * Get user by session token
   */
  async getUserFromToken(sessionToken: string) {
    const session = await this.getSession(sessionToken);
    return session?.user || null;
  }

  /**
   * Validate session
   */
  async validateSession(sessionToken: string): Promise<boolean> {
    const session = await this.getSession(sessionToken);
    return !!session;
  }
}