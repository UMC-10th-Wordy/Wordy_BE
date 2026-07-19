import { prisma } from '../../db.config';
import { AuthProvider, AgreementType as PrismaAgreementType } from '../../generated/prisma/client';
import { AgreementInput } from './auth.dto';

export class AuthRepository {
  public async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  public async findById(userId: string) {
    return prisma.user.findUnique({ where: { userId } });
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
}