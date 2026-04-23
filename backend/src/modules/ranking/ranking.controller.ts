import { Request, Response } from 'express';
import { rankingService } from './ranking.service';
import { RankingQuery } from './ranking.schema';

export class RankingController {
  getRanking = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RankingQuery;
    const ranking = await rankingService.getRoomRanking(userId, roomId, query);

    res.status(200).json({
      message: 'Ranking retrieved successfully',
      data: ranking,
    });
  };
}

export const rankingController = new RankingController();
