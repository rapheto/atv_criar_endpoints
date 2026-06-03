import { GuessRepository } from "../repositories/guess.repository.js";
import { MatchRepository } from "../repositories/match.repository.js";
import { PoolRepository } from "../repositories/pool.repository.js";
import { RankingRepository } from "../repositories/ranking.repository.js";

const guessRepo = new GuessRepository();
const matchRepo = new MatchRepository();
const poolRepo = new PoolRepository();
const rankingRepo = new RankingRepository();

export class GuessService {
  async create(payload: {
    poolId: number;
    participantId: number;
    matchId: number;
    homeScore: number;
    awayScore: number;
  }) {
    // implementar depois
  }

  async update(id: number, payload: { homeScore?: number; awayScore?: number }) {
    // implementar depois
  }

  async ranking(poolId: number) {
    const pool = await poolRepo.findById(poolId);

    if (!pool) {
      throw {
        status: 404,
        message: "Bolão não encontrado",
      };
    }

    const guesses = await rankingRepo.listByPool(poolId);

    const rankingMap = new Map<
      number,
      {
        participantId: number;
        name: string;
        email: string;
        totalPoints: number;
      }
    >();

    guesses.forEach((guess: any) => {
      const participant = guess.participant;

      if (!rankingMap.has(participant.id)) {
        rankingMap.set(participant.id, {
          participantId: participant.id,
          name: participant.name,
          email: participant.email,
          totalPoints: 0,
        });
      }

      const current = rankingMap.get(participant.id)!;

      current.totalPoints += guess.points ?? 0;
    });

    return Array.from(rankingMap.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
  }

  async removeParticipant(poolId: number, participantId: number) {
    // implementar depois
  }
}