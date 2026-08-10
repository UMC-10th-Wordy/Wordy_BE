import { prisma } from "../../common/prisma/prisma.client.js";

export class WorkspaceRepository {
  async countByUserId(userId: string): Promise<number> {
    return prisma.workspace.count({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async create(
    userId: string,
    name: string,
  ) {
    return prisma.workspace.create({
      data: {
        userId,
        name,
      },
    });
  }

  async findAllByUserId(userId: string) {
    return prisma.workspace.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findByIdAndUserId(
    workspaceId: string,
    userId: string,
  ) {
    return prisma.workspace.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
    });
  }

  async softDelete(
    workspaceId: string,
    userId: string,
  ) {
    return prisma.workspace.updateMany({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}