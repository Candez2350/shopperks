import { Coupon, Redemption, User, Badge, Store } from '../types';
import { supabase } from './supabase';

// This service interacts with the Supabase Backend
// It abstracts all database operations for the application.

export const BackendService = {
  
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) {
      console.error("Error fetching coupons:", error);
      throw error;
    }
    // The Coupon type in types.ts might need adjustments
    // to perfectly match the Supabase table (e.g., availableQuantity vs current_usage).
    // For now, we'll do a simple mapping.
    return data.map(c => ({
      ...c,
      availableQuantity: c.max_usage - c.current_usage,
      expiryDate: c.end_date,
    })) as Coupon[];
  },
  
  async getStores(): Promise<Store[]> {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) {
      console.error("Error fetching stores:", error);
      throw error;
    }
    return data;
  },
  
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
    return data;
  },
  
  async getUserById(id: string): Promise<User | null> {
     const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
     if (error) {
       console.error("Error fetching user by id:", error);
       // Don't throw if it's just 'not found', return null
       if (error.code === 'PGRST116') return null; 
       throw error;
     }
     return data;
  },

  // --- CRUD Functions ---

  // Stores
  async addStore(storeData: Omit<Store, 'id'>): Promise<Store> {
    const { data, error } = await supabase.from('stores').insert(storeData).select().single();
    if (error) throw error;
    return data;
  },
  async updateStore(storeData: Partial<Store> & { id: string }): Promise<Store> {
    const { data, error } = await supabase.from('stores').update(storeData).eq('id', storeData.id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteStore(storeId: string): Promise<void> {
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (error) throw error;
  },

  // Users
  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    console.warn("Security Warning: Creating a user profile without creating an auth user. The new user will not be able to log in.");
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data;
  },
  async updateUser(userData: Partial<User> & { id: string }): Promise<User> {
    const { data, error } = await supabase.from('users').update(userData).eq('id', userData.id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteUser(userId: string): Promise<void> {
    console.warn("Security Warning: Deleting a user profile does not delete the corresponding auth.user from Supabase.");
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  // Coupons
  async createCoupon(couponData: Omit<Coupon, 'id'>): Promise<Coupon> {
    const { data, error } = await supabase.from('coupons').insert(couponData).select().single();
    if (error) throw error;
    return data as Coupon;
  },
  async deleteCoupon(couponId: string): Promise<void> {
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (error) throw error;
  },


  async redeemCoupon(userId: string, couponId: string): Promise<{ token: string, redemption: Redemption, badgeEarned?: Badge }> {
    const { data, error } = await supabase.rpc('redeem_coupon', {
      p_user_id: userId,
      p_coupon_id: couponId
    });

    if (error) {
      console.error("Error redeeming coupon:", error);
      // Friendly error messages
      if (error.message.includes('CUPOM_ESGOTADO')) throw new Error('Este cupom esgotou!');
      if (error.message.includes('LIMITE_DE_USO_ATINGIDO')) throw new Error('Você já atingiu o limite de uso para este cupom.');
      throw new Error('Não foi possível resgatar o cupom.');
    }

    // Omit badgeEarned for now as it's not in the DB schema
    return { token: (data as Redemption).unique_code, redemption: data as Redemption };
  },

  async getUserRedemptions(requestingUserId: string, targetUserId: string, role: string): Promise<Redemption[]> {
    if (role !== 'ADMIN' && requestingUserId !== targetUserId) {
      throw new Error("Acesso negado: Você não pode visualizar a carteira de outro usuário.");
    }
    
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('redeemed_at', { ascending: false });

    if (error) {
      console.error("Error fetching user redemptions:", error);
      throw error;
    }
    return data;
  },

  async validateRedemption(uniqueCode: string, managerUserId: string): Promise<boolean> {
    // 1. Get manager's store_id
    const { data: manager, error: managerError } = await supabase.from('users').select('store_id').eq('id', managerUserId).single();
    if (managerError || !manager?.store_id) throw new Error("Gerente não encontrado ou não associado a uma loja.");

    // 2. Find the redemption by its unique code
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .select('id, status, coupon_id, coupons ( store_id )')
      .eq('unique_code', uniqueCode)
      .single();

    if (redemptionError || !redemption) {
      console.error("Validation Error: Redemption not found or query failed.", redemptionError);
      return false;
    }

    // 3. Perform validation checks
    // @ts-ignore
    if (redemption.coupons?.store_id !== manager.store_id) {
      throw new Error("Este cupom não pertence à sua loja.");
    }

    if (redemption.status !== 'PENDING') {
      console.warn(`Attempted to validate an already processed coupon: ID ${redemption.id}, Status: ${redemption.status}`);
      return false;
    }

    // 4. Update the redemption status to 'USED'
    const { error: updateError } = await supabase
      .from('redemptions')
      .update({ 
        status: 'USED', 
        validated_at: new Date().toISOString(),
        validated_by: managerUserId // Storing manager's ID
      })
      .eq('id', redemption.id);

    if (updateError) {
      console.error("Error updating redemption status:", updateError);
      throw updateError;
    }

    return true;
  },
};
