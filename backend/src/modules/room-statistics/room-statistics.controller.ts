import { Request, Response } from 'express';
import { roomStatisticsService } from './room-statistics.service';
import { RoomStatsQuery } from './room-statistics.schema';

export class RoomStatisticsController {
  getOverview = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RoomStatsQuery;
    const data = await roomStatisticsService.getOverview(userId, roomId, query);

    res.status(200).json({
      message: 'Room overview statistics retrieved successfully',
      data,
    });
  };

  getByMember = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RoomStatsQuery;
    const data = await roomStatisticsService.getByMember(userId, roomId, query);

    res.status(200).json({
      message: 'Room member statistics retrieved successfully',
      data,
    });
  };

  getByDay = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RoomStatsQuery;
    const data = await roomStatisticsService.getByDay(userId, roomId, query);

    res.status(200).json({
      message: 'Room daily statistics retrieved successfully',
      data,
    });
  };

  getBySubject = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RoomStatsQuery;
    const data = await roomStatisticsService.getBySubject(userId, roomId, query);

    res.status(200).json({
      message: 'Room subject statistics retrieved successfully',
      data,
    });
  };
}

export const roomStatisticsController = new RoomStatisticsController();
