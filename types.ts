
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface Store {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  coverUrl: string;
  floor: string;
}

export interface Coupon {
  id: string;
  storeId: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  expiryDate: string;
  rules: string[];
  category: string;
  availableQuantity: number;
  maxUsesPerUser: number;
  // AI & Dynamic Pricing features
  isFlashDeal?: boolean; 
  trendingScore?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  avatarUrl?: string;
  // Gamification
  badges?: Badge[];
  xp?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Emoji or URL
  description: string;
  earnedAt: string;
}

export interface Redemption {
  id: string;
  couponId: string;
  userId: string;
  code: string;
  status: 'PENDING' | 'USED' | 'EXPIRED';
  redeemedAt: string;
  validatedBy?: string;
  validatedAt?: string;
}
