export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',
  USERNAME_ALREADY_EXISTS: 'A user with this username already exists',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid or malformed token',
  TOKEN_MISSING: 'Authentication token is required',

  // User
  USER_NOT_FOUND: 'User not found',
  CURRENT_PASSWORD_WRONG: 'Current password is incorrect',
  CANNOT_DELETE_ROOM_OWNER: 'Cannot delete account while you are the sole owner of a room. Transfer ownership first.',

  // Study Sessions
  SESSION_NOT_FOUND: 'Study session not found',
  SESSION_NOT_OWNED: 'You can only modify your own study sessions',
  INVALID_DURATION: 'Duration must be greater than 0 seconds',
  NOT_ROOM_MEMBER_FOR_SESSION: 'You must be a member of the room to link a session to it',

  // Timer
  TIMER_ALREADY_ACTIVE: 'You already have an active timer. Finish or cancel it first.',
  TIMER_NOT_FOUND: 'Active timer not found',
  TIMER_NOT_OWNED: 'You can only control your own timer',
  TIMER_NOT_RUNNING: 'Timer is not running. Cannot pause.',
  TIMER_NOT_PAUSED: 'Timer is not paused. Cannot resume.',
  TIMER_ALREADY_FINISHED: 'Timer has already been finished',

  // Rooms
  ROOM_NOT_FOUND: 'Room not found',
  ROOM_INVITE_INVALID: 'Invalid invite code',
  ROOM_ALREADY_MEMBER: 'You are already a member of this room',
  ROOM_NOT_MEMBER: 'You are not a member of this room',
  ROOM_INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions for this action',
  ROOM_CANNOT_REMOVE_OWNER: 'Cannot remove the room owner',
  ROOM_ONLY_OWNER_CAN_DELETE: 'Only the room owner can delete a room',
  ROOM_CANNOT_LEAVE_AS_SOLE_OWNER: 'Cannot leave the room as the sole owner. Transfer ownership first.',
  ROOM_CANNOT_DEMOTE_SOLE_OWNER: 'Cannot demote the sole owner of the room',
  ROOM_MEMBER_NOT_FOUND: 'Member not found in this room',
  ROOM_CANNOT_CHANGE_OWN_ROLE: 'You cannot change your own role',
} as const;
