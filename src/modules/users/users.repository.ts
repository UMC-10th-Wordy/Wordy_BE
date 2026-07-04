import { prisma } from '../../db.config';
import {
  YearsOfService as PrismaYearsOfService,
  JobRole as PrismaJobRole,
} from '../../generated/prisma/client';
import { YearsOfService, JobRole } from './users.dto';

interface UpdateProfileData {
  userName: string;
  profileImgUrl?: string;
  yearsOfService: YearsOfService;
  jobRole: JobRole;
}

export class UsersRepository {
  public async upsertProfile(userId: string, data: UpdateProfileData) {
    const profileData = {
      userName: data.userName,
      profileImgUrl: data.profileImgUrl,
      yearsOfService: data.yearsOfService as unknown as PrismaYearsOfService,
      jobRole: data.jobRole as unknown as PrismaJobRole,
    };

    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
      include: { user: { select: { email: true } } },
    });
  }

  public async findById(userId: string) {
    return prisma.user.findUnique({ where: { userId }, include: { profile: true } });
  }
}
