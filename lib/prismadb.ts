// This file creates and exports a Prisma client instance
// It uses a global singleton pattern to prevent multiple client instances in development
import { PrismaClient } from '@prisma/client';

const client = global.prismadb || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prismadb = client;

export default client;