import { Request, Response } from "express";
import { GuessService } from "../../infrastructure/services/guess.service.js";

const service = new GuessService();

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
      const poolId = Number(req.params.poolId);
  
      const ranking = await service.ranking(poolId);
  
      return res.json(ranking);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: err.message || "Internal error",
      });
    }
  };

  removeParticipant = async (req: Request, res: Response) => {
    try {
      // dica: poolId e participantId vêm de req.params (converter para número)
      // retornar res.status(204).send()
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };
}
