import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@assetbox/database';
import { Resend } from 'resend';
import { nanoid } from 'nanoid';
import { Adapter } from 'next-auth/adapters';

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as Adapter,

  providers: [
    EmailProvider({
      server: '', // Not used with Resend
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',

      async sendVerificationRequest({ identifier: email, url }) {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Sign in to AssetBox',
            html: `
              <div style="font-family: Arial, sans-serif; max-width:  600px; margin: 0 auto;">
                <h2>Sign in to AssetBox</h2>
                <p>Click the button below to sign in to your account:</p>
                <a href="${url}" 
                   style="display: inline-block; background:  #000; color: #fff; padding:  12px 24px; 
                          text-decoration: none; border-radius: 5px; margin:  20px 0;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #666; font-size: 14px;">
                  This link will expire in 24 hours.
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Failed to send verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },

      // Increase token validity to 24 hours
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
    error: '/login/error',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },

    async redirect({ url, baseUrl }) {
      // If url is relative, prepend baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // If url is on same origin, allow
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },

    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.username = user.username as string;
        session.user.isAdmin = (user as any).isAdmin || false;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Generate username for new users
        const username = nanoid(10);
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};