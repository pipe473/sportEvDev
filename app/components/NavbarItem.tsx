"use client";

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface NavbarItemProps {
    label: string;
    onClick?: () => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ label, onClick }) => {
    const router = useRouter();

    const handleClick = async () => {
        if (label === "Cerrar sesión") {
            await signOut({ redirect: false });
            router.push('/start');
        } else if (label === "Mis eventos") {
            router.push('/my-events');
        } else if (label === "Próximos eventos") {
            router.push('/upcoming-events');
        } else if (label === "Sobre nosotros") {
            router.push('/about');
        }
        onClick?.();
    };

    return (
        <div className="text-white cursor-pointer hover:text-red-500 transition p-0 hover:text-shadow-neon" onClick={handleClick}>
            {label}
        </div>
    )
}

export default NavbarItem;