/**
 * Authorization and Role Management Utilities
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prismadb from '@/lib/prismadb';

export type UserRole = 'user' | 'organizer';

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

/**
 * Get authenticated user with role information
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return null;
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        if (!user || !user.email) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: (user.role || 'user') as UserRole
        };
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser();
    
    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Check if user has organizer role
 */
export async function requireOrganizer(): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (user.role !== 'organizer') {
        throw new Error('Forbidden: Organizer role required');
    }

    return user;
}

/**
 * Check if user has specific role
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (user.role !== requiredRole) {
        throw new Error(`Forbidden: ${requiredRole} role required`);
    }

    return user;
}

/**
 * Check if user has one of the required roles
 */
export async function requireAnyRole(requiredRoles: UserRole[]): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (!requiredRoles.includes(user.role)) {
        throw new Error(`Forbidden: One of these roles required: ${requiredRoles.join(', ')}`);
    }

    return user;
}

/**
 * Check if user can access a resource (owns it or is organizer)
 */
export async function canAccessResource(resourceUserId: string): Promise<boolean> {
    const user = await getAuthenticatedUser();
    
    if (!user) {
        return false;
    }

    // Organizers can access any resource
    if (user.role === 'organizer') {
        return true;
    }

    // Users can only access their own resources
    return user.id === resourceUserId;
}

/**
 * Check if user can manage event (is organizer or event owner)
 */
export async function canManageEvent(eventId: string): Promise<boolean> {
    const user = await getAuthenticatedUser();
    
    if (!user) {
        return false;
    }

    // Organizers can manage any event
    if (user.role === 'organizer') {
        return true;
    }

    // For now, only organizers can manage events
    // In the future, you might add event.organizerId to allow users to create their own events
    return false;
}

