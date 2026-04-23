import { Request, Response } from 'express';
import { authService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as RegisterInput;
    const result = await authService.register(data);

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as LoginInput;
    const result = await authService.login(data);

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  };
}

export const authController = new AuthController();
