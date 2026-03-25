import prisma from '@/lib/prisma';

// TODO: Remove this file and   move the function to relevant reo
export class AdminResourceRepository {
  async allocateResources(
    resource_type: string,
    resource_id: string,
    allocation: Record<string, unknown>
  ) {
    const model = prisma[resource_type as keyof typeof prisma] as unknown as {
      update: (args: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => Promise<unknown>;
    };

    await model.update({ where: { id: resource_id }, data: allocation });

    await prisma.moderationLog.create({
      data: {
        content_id: resource_id,
        content_type: resource_type,
        action: 'resource_allocation',
        notes: JSON.stringify(allocation),
        moderator_id: allocation.moderator_id as string,
      },
    });
  }
}
