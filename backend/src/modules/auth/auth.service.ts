import { prisma } from '../../database/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { RegisterInput, LoginInput } from './auth.schema';
import { AuthResponse } from './auth.types';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictError(ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictError(ErrorCodes.USERNAME_ALREADY_EXISTS);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarUrl: true,
      },
    });

    const token = signToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError(ErrorCodes.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError(ErrorCodes.INVALID_CREDENTIALS);
    }

    const token = signToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }
}

export const authService = new AuthService();
