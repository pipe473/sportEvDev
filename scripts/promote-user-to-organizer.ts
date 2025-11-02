/**
 * Script para promover un usuario a organizador
 * Uso: npx tsx scripts/promote-user-to-organizer.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Error: Debes proporcionar un email');
        console.log('\nUso:');
        console.log('  npx tsx scripts/promote-user-to-organizer.ts <email>');
        console.log('\nEjemplo:');
        console.log('  npx tsx scripts/promote-user-to-organizer.ts usuario@example.com');
        process.exit(1);
    }

    try {
        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ Error: Usuario con email "${email}" no encontrado`);
            process.exit(1);
        }

        // Verificar si ya es organizador
        if (user.role === 'organizer') {
            console.log(`ℹ️  El usuario "${email}" ya es organizador`);
            process.exit(0);
        }

        // Promover a organizador
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                role: 'organizer'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        console.log('✅ Usuario promovido a organizador exitosamente!');
        console.log('\nUsuario actualizado:');
        console.log(JSON.stringify(updatedUser, null, 2));

    } catch (error) {
        console.error('❌ Error al promover usuario:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

