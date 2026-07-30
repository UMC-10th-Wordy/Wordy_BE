import { prisma } from '../../db.config.js';
import { Prisma } from '../../generated/prisma/client.js';
import { CreateTagRequest, UpdateTagRequest } from './tag.dto.js';

export class TagRepository {
  public async findManyByUserId(userId: string) {
    return prisma.tag.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async findById(tagId: string) {
    return prisma.tag.findUnique({
      where: { tagId },
    });
  }

  public async findActiveByIdAndUserId(tagId: string, userId: string) {
    return prisma.tag.findFirst({
      where: {
        tagId,
        userId,
        deletedAt: null,
      },
    });
  }

  public async create(userId: string, body: CreateTagRequest) {
    return prisma.tag.create({
      data: {
        userId,
        tagName: body.tagName,
        color: body.color,
        projectName: body.projectName,
        projectPurpose: body.projectPurpose,
        expectedOutcome: body.expectedOutcome,
        expectedStartDate: body.expectedStartDate ? new Date(body.expectedStartDate) : null,
        expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : null,
        kpis: body.kpis === undefined ? Prisma.JsonNull : body.kpis as Prisma.InputJsonValue,
      },
    });
  }

  public async update(tagId: string, body: UpdateTagRequest) {
    return prisma.tag.update({
      where: { tagId },
      data: {
        ...(body.tagName !== undefined && { tagName: body.tagName }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.projectName !== undefined && { projectName: body.projectName }),
        ...(body.projectPurpose !== undefined && { projectPurpose: body.projectPurpose }),
        ...(body.expectedOutcome !== undefined && { expectedOutcome: body.expectedOutcome }),
        ...(body.expectedStartDate !== undefined && {
          expectedStartDate: body.expectedStartDate ? new Date(body.expectedStartDate) : null,
        }),
        ...(body.expectedEndDate !== undefined && {
          expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : null,
        }),
        ...(body.kpis !== undefined && {
          kpis: body.kpis === null ? Prisma.JsonNull : body.kpis as Prisma.InputJsonValue,
        }),
      },
    });
  }

  public async softDelete(tagId: string) {
    return prisma.tag.update({
      where: { tagId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}