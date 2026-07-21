export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const USERNAME_INPUT_PATTERN =
  '@?[A-Za-z0-9][A-Za-z0-9_]{2,29}';

export function getUsernameHandle(username: string): string {
  return username.startsWith('@') ? username.slice(1) : username;
}
