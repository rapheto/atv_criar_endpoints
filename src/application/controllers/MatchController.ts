import { Request, Response } from "express";
import { MatchRepository } from "../../infrastructure/repositories/match.repository.js";

const matchRepo = new MatchRepository();

export class MatchController {
  list = async (req: Request, res: Response) => {
    try {
      // dica: extrair stage e status de req.query e passar para matchRepo.list
      // retornar res.json(matches)
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message || "Internal error" });
    }
  };
}
