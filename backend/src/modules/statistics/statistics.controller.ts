import { Request, Response } from 'express';
import { statisticsService } from './statistics.service';
import { StatisticsQuery } from './statistics.schema';

export class StatisticsController {
  getOverview = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getOverview(userId, query);

    res.status(200).json({
      message: 'Overview statistics retrieved successfully',
      data,
    });
  };

  getBySubject = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getBySubject(userId, query);

    res.status(200).json({
      message: 'Subject statistics retrieved successfully',
      data,
    });
  };

  getByDay = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getByDay(userId, query);

    res.status(200).json({
      message: 'Daily statistics retrieved successfully',
      data,
    });
  };

  getByWeek = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getByWeek(userId, query);

    res.status(200).json({
      message: 'Weekly statistics retrieved successfully',
      data,
    });
  };

  getByMonth = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getByMonth(userId, query);

    res.status(200).json({
      message: 'Monthly statistics retrieved successfully',
      data,
    });
  };

  getHeatmap = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as StatisticsQuery;
    const data = await statisticsService.getHeatmap(userId, query);

    res.status(200).json({
      message: 'Heatmap data retrieved successfully',
      data,
    });
  };
}

export const statisticsController = new StatisticsController();
