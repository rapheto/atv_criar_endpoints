import { Request, Response } from "express";
import { GuessService } from "../../infrastructure/services/guess.service.js";
import { PoolRepository } from "../../infrastructure/repositories/pool.repository.js";

const service = new GuessService();
const poolRepository = new PoolRepository();


export class GuessController {
  create = async (req: Request, res: Response) => {
    try {
      // dica: extrair poolId, participantId, matchId, homeScore, awayScore de req.body
      // retornar res.status(201).json(guess)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      // dica: id vem de req.params.id (converter para número)
      // homeScore e awayScore vêm de req.body
      // retornar res.json(updated)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };

  ranking = async (req: Request, res: Response) => {
    try {
      // dica: poolId vem de req.params.poolId (converter para número)
      // retornar res.json(ranking)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };

  removeParticipant = async (req: Request, res: Response) => {
    try {
      const { poolId, participantId } = req.params;
      const participant = await poolRepository.findParticipant(Number(poolId), Number(participantId));
      if (!participant) {
        throw { status: 404, message: "Participante não encontrado" };
      }
      const pool = await poolRepository.findById(Number(poolId));
      if (!pool) {
        throw { status: 404, message: "Bolão não encontrado" };
      }
      const deleted = await poolRepository.removeParticipant(Number(poolId), Number(participantId));
      res.status(204).json(deleted);
      
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };
}
