import { prisma } from "../prisma/index.js";

export class PoolRepository {
  async findById(id: number) {
    // dica: prisma.pool.findUnique({ where: { id }, include: { participants: true } })
    return prisma.pool.findUnique({
      where: { id },
      include: { participants: true },
    });
  }

  async findParticipant(poolId: number, participantId: number) {
    // dica: prisma.participant.findFirst({ where: { id: participantId, poolId } })
    return prisma.participant.findFirst({
      where: { id: participantId, poolId },
    });
  }

  async removeParticipant(poolId: number, participantId: number) {
    // dica: prisma.participant.delete({ where: { id: participantId, poolId } })
    return prisma.participant.delete({
      where: { id: participantId, poolId },
    });
  }
}
