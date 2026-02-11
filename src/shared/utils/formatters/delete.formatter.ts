import type { UserDTO } from '@core';

/**
 * Generate delete confirmation message for a user
 *
 * @param user - User object
 * @param userId - User ID
 * @returns Formatted delete confirmation message
 */
export function generateDeleteMessage(user: UserDTO, userId: string): string {
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;
  const email = user.email;
  return `Delete user "${fullName}" (${email})?\n\nThis action cannot be undone.`;
}
