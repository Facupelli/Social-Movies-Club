export const NOTIFICATION_TYPE_CODES = {
  USER_FOLLOW: 'user_follow',
} as const;

export type NotificationTypeCode =
  (typeof NOTIFICATION_TYPE_CODES)[keyof typeof NOTIFICATION_TYPE_CODES];

export const NOTIFICATION_TEMPLATES: Record<NotificationTypeCode, string> = {
  [NOTIFICATION_TYPE_CODES.USER_FOLLOW]: 'ahora te sigue',
};
