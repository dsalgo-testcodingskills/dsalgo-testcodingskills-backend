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

export enum SUBSCRIPTION_STATUS {
  CREATED = 'created', // Initialized, but no payment has been committed yet
  AUTHENTICATED = 'authenticated', // Initial authentication successful (e.g., for ₹0 or trial), waiting for first charge
  ACTIVE = 'active', // Subscription is live and payments are current
  PENDING = 'pending', // A payment failed; Razorpay is currently retrying the charge
  HALTED = 'halted', // All retries failed; subscription is suspended but not yet terminated
  CANCELLED = 'cancelled', // Subscription is terminated either by user, admin, or after halting
  COMPLETED = 'completed', // All billing cycles (e.g., 12/12) have been successfully completed
  EXPIRED = 'expired', // Subscription never started and exceeded its validity/start time
}