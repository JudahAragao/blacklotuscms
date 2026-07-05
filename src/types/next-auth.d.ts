import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: {
      id: string;
      name: string;
      capabilities: Record<string, any>;
    };
  }

  interface Session {
    user: {
      id: string;
      role?: {
        id: string;
        name: string;
        capabilities: Record<string, any>;
      };
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: {
      id: string;
      name: string;
      capabilities: Record<string, any>;
    };
  }
}
