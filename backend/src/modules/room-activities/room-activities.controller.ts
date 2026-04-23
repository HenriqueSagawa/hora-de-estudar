import { Request, Response } from 'express';
import { roomActivitiesService } from './room-activities.service';
import { RoomActivitiesQuery } from './room-activities.schema';

export class RoomActivitiesController {
  getActivities = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id: roomId } = req.params;
    const query = req.query as unknown as RoomActivitiesQuery;
    const data = await roomActivitiesService.getActivities(userId, roomId, query);

    res.status(200).json({
      message: 'Activities retrieved successfully',
      data,
    });
  };
}

export const roomActivitiesController = new RoomActivitiesController();
