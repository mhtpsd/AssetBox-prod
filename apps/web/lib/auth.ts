import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@assetbox/database';
import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { Resend } from 'resend';

export const authOptions: NextAuthOptions = {
  adapter:  PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier:  email, url }) => {
        // In development, just log the URL
        if (process.env. NODE_ENV === 'development') {
          console.log(`\n🔐 Login link for ${email}:\n${url}\n`);
          return;
        }

        // In production, send email via Resend
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          await resend.emails. send({
            from: process.env. EMAIL_FROM! ,
            to:  email,
            subject: 'Sign in to AssetBox',
            html: `
              <! DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family:  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
                  <div style="max-width:  600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                      <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin:  0 0 24px 0; text-align: center;">
                        Sign in to AssetBox
                      </h1>
                      <p style="color:  #6b7280; font-size:  16px; line-height: 24px; margin: 0 0 24px 0;">
                        Click the button below to sign in to your account.  This link will expire in 15 minutes.
                      </p>
                      <div style="text-align: center; margin:  32px 0;">
                        <a href="${url}" 
                           style="display: inline-block; background-color: #111827; color: #ffffff; 
                                  padding: 12px 32px; text-decoration: none; border-radius: 6px; 
                                  font-weight: 500; font-size:  16px;">
                          Sign in to AssetBox
                        </a>
                      </div>
                      <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 24px 0 0 0;">
                        If you didn't request this email, you can safely ignore it.
                      </p>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                      © ${new Date().getFullYear()} AssetBox. All rights reserved.
                    </p>
                  </div>
                </body>
              </html>
            `,
          });
        } catch (error) {
          console.error('Error sending verification email:', error);
          throw new Error('Error sending verification email');
        }
      },
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
    async session({ session, user }) {
      if (session.user) {
        session.user. id = user.id;
        session. user.username = (user as any).username;
        session. user.isAdmin = (user as any).isAdmin;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Generate username from email
      const baseUsername = user.email?. split('@')[0] || 'user';
      const randomSuffix = Math.random().toString(36).slice(2, 6);
      const username = `${baseUsername}${randomSuffix}`.toLowerCase().replace(/[^a-z0-9]/g, '');

      await prisma.user. update({
        where: { id: user.id },
        data: { username },
      });
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export default handler;