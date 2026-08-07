import { prisma } from "../common/prisma/prisma.client.js";

export const startSnapshotCleanupJob = () => {
  setInterval(async () => {
    try {
      const limitTime = new Date(
        Date.now() - 10 * 60 * 1000,
      );

      const result =
        await prisma.reflectionSnapshot.updateMany({
          where: {
            status: "PROCESSING",
            updatedAt: {
              lt: limitTime,
            },
          },
          data: {
            status: "FAILED",
          },
        });

      console.log(
        `[Snapshot Cleanup] ${result.count}개 FAILED 처리`,
      );

    } catch(error) {
      console.error(
        "Snapshot cleanup error",
        error,
      );
    }
  }, 60 * 1000);
};