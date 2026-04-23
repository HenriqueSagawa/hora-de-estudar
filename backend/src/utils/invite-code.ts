import crypto from 'crypto';

const INVITE_CODE_LENGTH = 8;

export function generateInviteCode(): string {
  return crypto
    .randomBytes(INVITE_CODE_LENGTH)
    .toString('base64url')
    .slice(0, INVITE_CODE_LENGTH)
    .toUpperCase();
}
