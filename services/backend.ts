import { Coupon, Redemption, User, Badge } from '../types';
import { COUPONS, MY_REDEMPTIONS, STORES, USERS } from '../constants';
import { SecurityService } from './security';
import { CacheService } from './cache';

// This service simulates a secure Backend API + Database
// It replaces direct access to constants in the UI components
// enforcing security rules and atomic operations.

// In-memory Database State (initialized from constants)
let dbCoupons = [...COUPONS];
let dbRedemptions = [...MY_REDEMPTIONS];
let dbUsers = JSON.parse(JSON.stringify(USERS)); // Deep copy to allow updates
const dbStores = [...STORES];

export const BackendService = {
  
  // 1. Scalability: Fetch Coupons with Caching Strategy
  async getCoupons(): Promise<Coupon[]> {
    const CACHE_KEY = 'feed:coupons:all';
    
    // Try Cache First (Redis)
    const cached = CacheService.get<Coupon[]>(CACHE_KEY);
    if (cached) return cached;

    // Simulate DB Latency
    // await new Promise(r => setTimeout(r, 300));

    // Database Fetch
    const coupons = [...dbCoupons];
    
    // Write to Cache
    CacheService.set(CACHE_KEY, coupons, 30); // 30s TTL
    return coupons;
  },

  // 2. Security: Atomic Redemption (Fixes Race Condition & Overselling)
  async redeemCoupon(userId: string, couponId: string): Promise<{ token: string, redemption: Redemption, badgeEarned?: Badge }> {
    // Simulate Network Latency
    await new Promise(r => setTimeout(r, 500));

    // A. Check Coupon Existence
    const couponIndex = dbCoupons.findIndex(c => c.id === couponId);
    if (couponIndex === -1) throw new Error("Cupom não encontrado.");
    const coupon = dbCoupons[couponIndex];

    // B. Critical Section (Atomic Check)
    if (coupon.availableQuantity <= 0) {
      throw new Error("Esgotado! Você perdeu por pouco.");
    }

    // C. Check User Limits (Business Logic)
    const userUsage = dbRedemptions.filter(r => r.userId === userId && r.couponId === couponId).length;
    if (userUsage >= coupon.maxUsesPerUser) {
      throw new Error("Limite de uso por pessoa atingido.");
    }

    // D. Atomic Decrement (Write)
    dbCoupons[couponIndex] = {
      ...coupon,
      availableQuantity: coupon.availableQuantity - 1
    };
    
    // Invalidate Cache since stock changed
    CacheService.invalidate('feed:coupons:all');

    // E. Generate Secure Token (Server-side Only)
    const token = await SecurityService.generateToken(couponId, userId);
    const payload = JSON.parse(atob(token)).payload;

    // F. Persist Redemption
    const newRedemption: Redemption = {
      id: payload.rid,
      couponId,
      userId,
      code: token,
      status: 'PENDING',
      redeemedAt: new Date().toISOString()
    };
    dbRedemptions.unshift(newRedemption);

    // G. Gamification Logic (Persisted)
    const userTotalRedemptions = dbRedemptions.filter(r => r.userId === userId).length;
    let badgeEarned: Badge | undefined = undefined;

    // Logic: First Redemption
    if (userTotalRedemptions === 1) {
       badgeEarned = {
         id: 'b_first',
         name: 'Primeira Compra',
         icon: '🛍️',
         description: 'Realizou o primeiro resgate de cupom.',
         earnedAt: new Date().toISOString()
       };
    }
    // Logic: 5th Redemption
    else if (userTotalRedemptions === 5) {
       badgeEarned = {
         id: 'b_explorer',
         name: 'Explorador de Ofertas',
         icon: '🧭',
         description: 'Resgatou 5 cupons no total.',
         earnedAt: new Date().toISOString()
       };
    }
    // Logic: 10th Redemption
    else if (userTotalRedemptions === 10) {
       badgeEarned = {
         id: 'b_vip',
         name: 'Cliente VIP',
         icon: '👑',
         description: 'Resgatou 10 cupons. Você é uma lenda!',
         earnedAt: new Date().toISOString()
       };
    }

    if (badgeEarned) {
      const uIndex = dbUsers.findIndex((u: User) => u.id === userId);
      if (uIndex !== -1) {
        if (!dbUsers[uIndex].badges) dbUsers[uIndex].badges = [];
        // Prevent duplicate badges
        if (!dbUsers[uIndex].badges.find((b: Badge) => b.id === badgeEarned!.id)) {
           dbUsers[uIndex].badges.push(badgeEarned);
        } else {
           badgeEarned = undefined; // Already has it
        }
      }
    }

    return { token, redemption: newRedemption, badgeEarned };
  },

  // 3. Security: Anti-IDOR (Insecure Direct Object Reference)
  async getUserRedemptions(requestingUserId: string, targetUserId: string, role: string): Promise<Redemption[]> {
    if (role !== 'ADMIN' && requestingUserId !== targetUserId) {
      throw new Error("Acesso negado: Você não pode visualizar a carteira de outro usuário.");
    }
    return dbRedemptions.filter(r => r.userId === targetUserId);
  },

  // 4. Security: Validation Logic
  async validateRedemption(rid: string, managerStoreId: string): Promise<boolean> {
    const redemptionIndex = dbRedemptions.findIndex(r => r.id === rid);
    if (redemptionIndex === -1) return false;

    const redemption = dbRedemptions[redemptionIndex];
    
    // Logic Check: Does this coupon belong to the Manager's store?
    const coupon = dbCoupons.find(c => c.id === redemption.couponId);
    if (!coupon || coupon.storeId !== managerStoreId) {
       throw new Error("Este cupom não pertence à sua loja.");
    }

    if (redemption.status !== 'PENDING') return false;

    dbRedemptions[redemptionIndex] = {
      ...redemption,
      status: 'USED',
      validatedAt: new Date().toISOString(),
      validatedBy: 'Gerente (App)'
    };
    
    return true;
  },
  
  // Helper for mock data initialization
  getStores: () => dbStores,
  getUsers: () => dbUsers,
  // Helper to re-fetch user data (e.g. after earning a badge)
  getUserById: (id: string) => dbUsers.find((u: User) => u.id === id)
};
