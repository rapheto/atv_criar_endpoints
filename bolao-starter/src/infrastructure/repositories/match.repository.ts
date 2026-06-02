import { prisma } from "../prisma/index.js";

export class MatchRepository {
  async list(filters: { stage?: string; status?: string }) {
    // dica: prisma.match.findMany com where dinâmico usando os filtros
    // orderBy: { kickoffAt: "asc" }
  }

  async findById(id: number) {
    // dica: prisma.match.findUnique({ where: { id } })
  }
}
