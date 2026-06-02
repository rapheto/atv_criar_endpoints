import { GuessRepository } from "../repositories/guess.repository.js";
import { MatchRepository } from "../repositories/match.repository.js";
import { PoolRepository } from "../repositories/pool.repository.js";

const guessRepo = new GuessRepository();
const matchRepo = new MatchRepository();
const poolRepo = new PoolRepository();

export class GuessService {
  async create(payload: {
    poolId: number;
    participantId: number;
    matchId: number;
    homeScore: number;
    awayScore: number;
  }) {
    // 1. buscar a partida pelo matchId — se não existir: { status: 404, message: "Partida não encontrada" }
    // 2. verificar se match.kickoffAt > new Date() — se não: { status: 409, message: "Partida já iniciada" }
    // 3. verificar se participante existe no bolão — se não: { status: 404, message: "Participante não encontrado neste bolão" }
    // 4. verificar se já existe palpite (findByParticipantAndMatch) — se sim: { status: 409, message: "Palpite já registrado para esta partida" }
    // 5. criar e retornar o palpite
  }

  async update(id: number, payload: { homeScore?: number; awayScore?: number }) {
    // 1. buscar o palpite pelo id — se não existir: { status: 404, message: "Palpite não encontrado" }
    // 2. verificar se match.kickoffAt > new Date() — se não: { status: 400, message: "Não é possível editar palpite após o início da partida" }
    // 3. atualizar e retornar o palpite
  }

  async ranking(poolId: number) {
    // 1. verificar se o bolão existe — se não: { status: 404, message: "Bolão não encontrado" }
    // 2. buscar todos os palpites do bolão (listByPool)
    // 3. agrupar por participante somando points
    // 4. retornar array ordenado por totalPoints desc:
    //    [{ participantId, name, email, totalPoints }]
  }

  async removeParticipant(poolId: number, participantId: number) {
    // 1. verificar se o bolão existe — se não: { status: 404, message: "Bolão não encontrado" }
    // 2. verificar se participante existe no bolão — se não: { status: 404, message: "Participante não encontrado" }
    // 3. remover e retornar undefined (204)
  }
}
