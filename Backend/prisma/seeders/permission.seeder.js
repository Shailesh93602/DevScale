"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const permissions = [
    {
        key: 'create',
        name: 'CREATE',
        description: 'Allows creation of resources',
    },
    {
        key: 'read',
        name: 'READ',
        description: 'Allows viewing of resources',
    },
    {
        key: 'update',
        name: 'UPDATE',
        description: 'Allows modification of resources',
    },
    {
        key: 'delete',
        name: 'DELETE',
        description: 'Allows deletion of resources',
    },
];
const seedPermissions = async () => {
    try {
        for (const permission of permissions) {
            await prisma.permission.upsert({
                where: { name: permission.name },
                update: { description: permission.description },
                create: permission,
            });
        }
        console.log(`Seeded ${permissions.length} permissions`);
    }
    catch (error) {
        console.error('Error seeding permissions:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedPermissions();
//# sourceMappingURL=permission.seeder.js.map