import { prisma } from "../prisma/index.js";

export class GuessRepository {
  async findByParticipantAndMatch(
    participantId: number,
    matchId: number,
    poolId: number
  ) {
    // dica: prisma.guess.findUnique com where participantId_matchId_poolId
    // include: { match: true, participant: true }
    return prisma.guess.findUnique({
      where: {
        participantId_matchId_poolId: { participantId, matchId, poolId },
      },
      include: { match: true, participant: true },
    });
  }

  async create(data: {
    poolId: number;
    participantId: number;
    matchId: number;
    homeScore: number;
    awayScore: number;
  }) {
    return prisma.guess.create({ data })
  }

  async update(id: number, data: { homeScore?: number; awayScore?: number }) {
    return prisma.guess.update({ where: { id }, data })
  }

  async findById(id: number) {
    // dica: prisma.guess.findUnique com include match e participant
    return prisma.guess.findUnique({
      where: { id },
      include: { match: true, participant: true },
    });
  }

  async listByPool(poolId: number) {
    // dica: prisma.guess.findMany({ where: { poolId }, include: { participant: true } })
    return prisma.guess.findMany({
      where: { poolId },
      include: { participant: true },
    });

  }
}
