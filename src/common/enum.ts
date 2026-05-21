export enum UserRoleEnum {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
}

export enum SubscriptionTypeEnum {
  Free = 'free',
  PREMIUM = 'premium',
}

export const PUBLIC_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];

export const RAZOR_WEBHOOK_KEY=process.env.RAZOR_WEBHOOK_KEY ;

export const subscriptionStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  CREATED: 'created',
  COMPLETED: 'completed',
};