import { Request, Response } from 'express';
import { usersService } from './users.service';
import { UpdateProfileInput, ChangePasswordInput, SearchUsersInput } from './users.schema';

export class UsersController {
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const user = await usersService.getProfile(userId);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: user,
    });
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = req.body as UpdateProfileInput;
    const user = await usersService.updateProfile(userId, data);

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = req.body as ChangePasswordInput;
    await usersService.changePassword(userId, data);

    res.status(200).json({
      message: 'Password changed successfully',
    });
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    await usersService.deleteAccount(userId);

    res.status(200).json({
      message: 'Account deleted successfully',
    });
  };

  searchUsers = async (req: Request, res: Response): Promise<void> => {
    const { q, page, pageSize } = req.query as unknown as SearchUsersInput;
    const result = await usersService.searchUsers(q, page, pageSize);

    res.status(200).json({
      message: 'Users found',
      data: result,
    });
  };
}

export const usersController = new UsersController();
