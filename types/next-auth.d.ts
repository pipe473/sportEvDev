import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string | null;
            name: string;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        email: string | null;
        name: string;
        hashedPassword: string | null;
        image: string | null;
        emailVerified: Date | null;
        createdAt: Date;
        updatedAt: Date;
        favoriteIds: string[];
    }
} 