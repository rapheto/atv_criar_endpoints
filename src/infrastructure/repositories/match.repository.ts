import { prisma } from "../prisma/index.js";
import { MatchStage, MatchStatus } from "@prisma/client";

export class MatchRepository {
  async list(filters: { stage?: MatchStage; status?: MatchStatus }) {
    return prisma.match.findMany({
      where: {
        ...(filters.stage && {stage: filters.stage}),
        ...(filters.status && {status: filters.status})
      },
      orderBy: {
        kickoffAt: "asc",
      }
    });
  }

  async findById(id: number) {
    return prisma.match.findUnique({
      where:{id}
    });
  }
}
