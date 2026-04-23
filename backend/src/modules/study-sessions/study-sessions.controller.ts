import { Request, Response } from 'express';
import { studySessionsService } from './study-sessions.service';
import {
  CreateManualSessionInput,
  StartTimerInput,
  FinishTimerInput,
  UpdateSessionInput,
  ListSessionsInput,
} from './study-sessions.schema';

export class StudySessionsController {
  // ---- Manual ----
  createManual = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = req.body as CreateManualSessionInput;
    const session = await studySessionsService.createManualSession(userId, data);

    res.status(201).json({
      message: 'Study session created successfully',
      data: session,
    });
  };

  // ---- Timer ----
  startTimer = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = req.body as StartTimerInput;
    const timer = await studySessionsService.startTimer(userId, data);

    res.status(201).json({
      message: 'Timer started successfully',
      data: timer,
    });
  };

  pauseTimer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const timer = await studySessionsService.pauseTimer(userId, id);

    res.status(200).json({
      message: 'Timer paused successfully',
      data: timer,
    });
  };

  resumeTimer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const timer = await studySessionsService.resumeTimer(userId, id);

    res.status(200).json({
      message: 'Timer resumed successfully',
      data: timer,
    });
  };

  finishTimer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body as FinishTimerInput;
    const session = await studySessionsService.finishTimer(userId, id, data);

    res.status(200).json({
      message: 'Timer finished and session created successfully',
      data: session,
    });
  };

  cancelTimer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    await studySessionsService.cancelTimer(userId, id);

    res.status(200).json({
      message: 'Timer cancelled successfully',
    });
  };

  getActiveTimer = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const timer = await studySessionsService.getActiveTimer(userId);

    res.status(200).json({
      message: timer ? 'Active timer found' : 'No active timer',
      data: timer,
    });
  };

  // ---- CRUD ----
  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as ListSessionsInput;
    const result = await studySessionsService.listSessions(userId, query);

    res.status(200).json({
      message: 'Study sessions fetched successfully',
      data: result,
    });
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const session = await studySessionsService.getSession(userId, id);

    res.status(200).json({
      message: 'Study session retrieved successfully',
      data: session,
    });
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body as UpdateSessionInput;
    const session = await studySessionsService.updateSession(userId, id, data);

    res.status(200).json({
      message: 'Study session updated successfully',
      data: session,
    });
  };

  remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    await studySessionsService.deleteSession(userId, id);

    res.status(200).json({
      message: 'Study session deleted successfully',
    });
  };
}

export const studySessionsController = new StudySessionsController();
