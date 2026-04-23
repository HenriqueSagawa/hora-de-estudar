import { usersRepository } from './users.repository';
import { comparePassword, hashPassword } from '../../utils/password';
import { AppError, ConflictError, NotFoundError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { UpdateProfileInput, ChangePasswordInput } from './users.schema';
import { UserProfile, UserSearchResult } from './users.types';
import { PaginatedResponse } from '../../types/common';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';

export class UsersService {
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserProfile> {
    // Check username uniqueness if updating
    if (data.username) {
      const existing = await usersRepository.findByUsername(data.username);
      if (existing && existing.id !== userId) {
        throw new ConflictError(ErrorCodes.USERNAME_ALREADY_EXISTS);
      }
    }

    const user = await usersRepository.update(userId, data);
    return user;
  }

  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const user = await usersRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const isCurrentPasswordValid = await comparePassword(
      data.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(ErrorCodes.CURRENT_PASSWORD_WRONG, 400);
    }

    const newHash = await hashPassword(data.newPassword);
    await usersRepository.update(userId, { passwordHash: newHash });
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if user is sole owner of any room
    const soleOwnerCount =
      await usersRepository.countOwnedRoomsAsSoleOwner(userId);

    if (soleOwnerCount > 0) {
      throw new AppError(ErrorCodes.CANNOT_DELETE_ROOM_OWNER, 400);
    }

    await usersRepository.delete(userId);
  }

  async searchUsers(
    query: string,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<UserSearchResult>> {
    const pagination = parsePagination({ page, pageSize });
    const { items, total } = await usersRepository.search(
      query,
      (pagination.page - 1) * pagination.pageSize,
      pagination.pageSize
    );

    return buildPaginatedResponse(items, total, pagination);
  }
}

export const usersService = new UsersService();
