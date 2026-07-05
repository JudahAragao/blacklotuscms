import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { SecretsService } from "@/lib/secrets";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

// Load secrets for NextAuth
const secrets = SecretsService.loadSync();

// Ensure NextAuth has the secrets in environment for internal logic
if (secrets.NEXTAUTH_URL) process.env.NEXTAUTH_URL = secrets.NEXTAUTH_URL;
if (secrets.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = secrets.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: secrets.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("[NextAuth] Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { role: true },
          });

          if (!user) {
            logger.warn(`[NextAuth] User not found: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isPasswordValid) {
            logger.warn(`[NextAuth] Invalid password for user: ${credentials.email}`);
            return null;
          }

          logger.info(`[NextAuth] Login successful: ${credentials.email}`);
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          logger.error("[NextAuth] Error in authorize callback:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
