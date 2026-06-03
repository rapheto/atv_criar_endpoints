import { prisma } from "../prisma/index.js";

export class PoolRepository {
  async findById(id: number) {
   const pool = await prisma.pool.findUnique({ where: { id } });
   return pool;
  }

  async findParticipant(poolId: number, participantId: number) {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId, poolId },
    });
    return participant;
  
  }

  async removeParticipant(poolId: number, participantId: number) {
    const participant = await prisma.participant.delete({
      where: { id: participantId, poolId },
    });
    return participant;
  }
}
