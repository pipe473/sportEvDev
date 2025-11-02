'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserRoleBadge() {
    const { data: session } = useSession();
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (session) {
            checkRole();
        } else {
            setChecking(false);
        }
    }, [session]);

    const checkRole = async () => {
        try {
            const response = await fetch('/api/organizer/events');
            setIsOrganizer(response.ok);
        } catch {
            setIsOrganizer(false);
        } finally {
            setChecking(false);
        }
    };

    if (checking || !session) {
        return null;
    }

    return (
        <>
            <Link
                href="/my-tickets"
                className="text-gray-200 hover:text-white cursor-pointer transition"
            >
                <i className="fa-regular fa-ticket mr-2"></i>
                Mis Entradas
            </Link>
            {isOrganizer && (
                <>
                    <Link
                        href="/organizer/dashboard"
                        className="text-gray-200 hover:text-white cursor-pointer transition"
                    >
                        <i className="fa-solid fa-qrcode mr-2"></i>
                        Validar
                    </Link>
                    <Link
                        href="/organizer/events"
                        className="text-gray-200 hover:text-white cursor-pointer transition"
                    >
                        <i className="fa-solid fa-calendar-plus mr-2"></i>
                        Gestionar
                    </Link>
                </>
            )}
        </>
    );
}

