
import { Coupon, User } from '../types';

export const AIService = {
  // 1. Dynamic Pricing Engine (Yield Management)
  // Randomly selects coupons to become "Flash Deals" based on "simulated" store traffic
  enrichCouponsWithDynamicPricing: (coupons: Coupon[]): Coupon[] => {
    return coupons.map(c => {
      // Simulate: 20% chance of a coupon being a "Flash Deal" right now
      const isFlash = Math.random() > 0.8;
      return {
        ...c,
        isFlashDeal: isFlash,
        // Increase discount virtually if flash (visual only for this mock)
        discountValue: isFlash ? Math.round(c.discountValue * 1.2) : c.discountValue,
        trendingScore: Math.floor(Math.random() * 100)
      };
    }).sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
  },

  // 2. Smart Push Notification Engine
  // Analyzes user context (time) to suggest relevant offers
  getSmartSuggestion: (user: User): { title: string, body: string, type: 'coffee' | 'lunch' | 'shopping' } | null => {
    const hour = new Date().getHours();
    
    // Coffee Break Trigger (14h - 16h)
    if (hour >= 14 && hour <= 16) {
      return {
        title: "☕ Pausa para o café?",
        body: `Olá ${user.name.split(' ')[0]}, o Kopenhagen está com movimento baixo agora. Que tal um expresso duplo com 50% OFF?`,
        type: 'coffee'
      };
    }
    
    // Lunch Trigger (11h - 13h)
    if (hour >= 11 && hour <= 13) {
       return {
         title: "🍔 Fome de Leão?",
         body: "O Burger King liberou 50 cupons extras de Whopper. Corra antes que acabe!",
         type: 'lunch'
       };
    }

    return null;
  }
};
