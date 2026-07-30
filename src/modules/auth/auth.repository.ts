import { prisma } from '../../db.config.js';
import { AuthProvider, AgreementType as PrismaAgreementType } from '../../generated/prisma/client.js';
import { AgreementInput } from './auth.dto.js';

export class AuthRepository {
  public async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  public async findById(userId: string) {
    return prisma.user.findUnique({ where: { userId } });
  }

  public async findByIdWithProfileAndPlan(userId: string) {
    return prisma.user.findUnique({
      where: { userId },
      include: { profile: true, plan: true },
    });
  }

  public async createUser(
    email: string,
    password: string | null,
    provider: AuthProvider,
    agreements: AgreementInput[],
  ) {
    return prisma.user.create({
      data: {
        email,
        password,
        provider,
        agreements: {
          create: agreements.map((agreement) => ({
            type: agreement.type as unknown as PrismaAgreementType,
            isAgreed: agreement.isAgreed,
          })),
        },
      },
    });
  }

  public async saveRefreshToken(userId: string, refreshToken: string) {
    return prisma.user.update({
      where: { userId },
      data: { refreshToken },
    });
  }

  public async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { userId },
      data: { lastLoginAt: new Date() },
    });
  }

  public async clearRefreshToken(userId: string) {
    return prisma.user.update({
      where: { userId },
      data: { refreshToken: null },
    });
  }

  public async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { userId },
      data: { password: passwordHash },
    });
  }

  public async withdrawUser(userId: string) {
    return prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date(), refreshToken: null },
    });
  }
}