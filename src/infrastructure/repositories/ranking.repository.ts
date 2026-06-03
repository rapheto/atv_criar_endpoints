import { prisma } from "../prisma/index.js";

export class RankingRepository {
  async listByPool(poolId: number) {
    return prisma.guess.findMany({
      where: {
        poolId,
      },
      include: {
        participant: true,
      },
    });
  }
}