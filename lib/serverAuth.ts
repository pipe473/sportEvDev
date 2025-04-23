// This file provides server-side authentication utilities
// It verifies the user's session and fetches the current user's data from the database
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import authOptions from "@/pages/api/auth/[...nextauth]";

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the user's session from the request
    const session = await getServerSession(req, res, authOptions) as Session | null;

    // If no session exists, user is not authenticated
    if (!session?.user) {
        throw new Error('Not signed in');
    }

    // Find the current user in the database
    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email || undefined
        }
    })

    // If user not found in database, throw error
    if (!currentUser) {
        throw new Error('Not signed in');
    }

    return currentUser;
};

export default serverAuth;