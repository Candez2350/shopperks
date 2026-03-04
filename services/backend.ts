import { Coupon, Redemption, User, Store, Badge } from '../types';
import { SecurityService } from './security';
import { supabase } from './supabase';

// Helper functions to map Database (snake_case) to App (camelCase)
const mapStore = (s: any): Store => ({
  id: s.id,
  name: s.name,
  category: s.category,
  logoUrl: s.logo_url,
  coverUrl: s.cover_url,
  floor: s.floor
});

const mapUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  storeId: u.store_id,
  avatarUrl: u.avatar_url // Assuming you might add this column later
});

const mapCoupon = (c: any): Coupon => ({
  id: c.id,
  storeId: c.store_id,
  title: c.title,
  description: c.description,
  discountType: c.discount_type,
  discountValue: c.discount_value,
  expiryDate: c.end_date,
  category: c.stores?.category || 'Geral', // Join logic
  availableQuantity: c.max_usage - c.current_usage,
  maxUsesPerUser: c.max_uses_per_user,
  rules: c.coupon_rules ? c.coupon_rules.map((r: any) => r.rule_text) : [],
  isFlashDeal: false // AI feature (client-side or separate table)
});

const mapRedemption = (r: any): Redemption => ({
  id: r.id,
  couponId: r.coupon_id,
  userId: r.user_id,
  code: r.unique_code,
  status: r.status,
  redeemedAt: r.redeemed_at,
  validatedAt: r.validated_at,
  validatedBy: r.validated_by // Note: Needs column in DB if you want to persist
});

export const BackendService = {
  
  // --- STORES CRUD ---
  async getStores(): Promise<Store[]> {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) throw error;
    return data.map(mapStore);
  },

  async createStore(store: Omit<Store, 'id'>): Promise<Store> {
    const { data, error } = await supabase.from('stores').insert({
      name: store.name,
      category: store.category,
      logo_url: store.logoUrl,
      cover_url: store.coverUrl,
      floor: store.floor
    }).select().single();
    
    if (error) throw error;
    return mapStore(data);
  },

  async updateStore(store: Store): Promise<Store> {
    const { data, error } = await supabase.from('stores').update({
      name: store.name,
      category: store.category,
      logo_url: store.logoUrl,
      cover_url: store.coverUrl,
      floor: store.floor
    }).eq('id', store.id).select().single();

    if (error) throw error;
    return mapStore(data);
  },

  async deleteStore(storeId: string): Promise<void> {
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (error) throw error;
  },

  // --- USERS CRUD ---
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data.map(mapUser);
  },

  async createUser(userData: Omit<User, 'id'>, password?: string): Promise<User> {
    // 1. Create in Supabase Auth (if password provided)
    let authId = null;
    if (password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
      });
      if (authError) throw authError;
      authId = authData.user?.id;
    }

    // 2. Create in Public Users Table
    const { data, error } = await supabase.from('users').insert({
      id: authId || undefined, // Use Auth ID if available, else auto-gen
      name: userData.name,
      email: userData.email,
      role: userData.role,
      store_id: userData.storeId,
      password_hash: 'managed_by_auth' // Placeholder if using Supabase Auth
    }).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async updateUser(user: User): Promise<User> {
    const { data, error } = await supabase.from('users').update({
      name: user.name,
      role: user.role,
      store_id: user.storeId
    }).eq('id', user.id).select().single();

    if (error) throw error;
    return mapUser(data);
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  // --- COUPONS CRUD ---
  async getCoupons(): Promise<Coupon[]> {
    // Fetch coupons with rules and store info
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        coupon_rules (rule_text),
        stores (category)
      `);
      
    if (error) throw error;
    return data.map(mapCoupon);
  },

  async createCoupon(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    // 1. Insert Coupon
    const { data: couponData, error: couponError } = await supabase.from('coupons').insert({
      store_id: coupon.storeId,
      title: coupon.title,
      description: coupon.description,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      start_date: new Date().toISOString(), // Default start now
      end_date: coupon.expiryDate,
      max_usage: coupon.availableQuantity, // Assuming initial qty is max
      current_usage: 0,
      max_uses_per_user: coupon.maxUsesPerUser
    }).select().single();

    if (couponError) throw couponError;

    // 2. Insert Rules
    if (coupon.rules && coupon.rules.length > 0) {
      const rulesData = coupon.rules.map(r => ({
        coupon_id: couponData.id,
        rule_text: r
      }));
      const { error: rulesError } = await supabase.from('coupon_rules').insert(rulesData);
      if (rulesError) console.error("Error inserting rules:", rulesError);
    }

    // Return complete object (fetching again to be clean or constructing manually)
    return { ...coupon, id: couponData.id, availableQuantity: couponData.max_usage };
  },

  async deleteCoupon(couponId: string): Promise<void> {
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (error) throw error;
  },

  // --- REDEMPTIONS ---
  async getRedemptions(): Promise<Redemption[]> {
    const { data, error } = await supabase.from('redemptions').select('*');
    if (error) throw error;
    return data.map(mapRedemption);
  },

  async getUserRedemptions(requestingUserId: string, targetUserId: string, role: string): Promise<Redemption[]> {
    if (role !== 'ADMIN' && requestingUserId !== targetUserId) {
      throw new Error("Acesso negado.");
    }
    const { data, error } = await supabase.from('redemptions').select('*').eq('user_id', targetUserId);
    if (error) throw error;
    return data.map(mapRedemption);
  },

  async redeemCoupon(userId: string, couponId: string): Promise<{ token: string, redemption: Redemption, badgeEarned?: Badge }> {
    // 1. Generate Token
    const token = await SecurityService.generateToken(couponId, userId);
    
    // 2. Insert into DB
    const { data, error } = await supabase.from('redemptions').insert({
      coupon_id: couponId,
      user_id: userId,
      unique_code: token, // Storing the full token as code for simplicity in this model
      status: 'PENDING',
      redeemed_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;

    // 3. Update Coupon Usage (Simple increment, real app needs atomic RPC)
    await supabase.rpc('increment_coupon_usage', { row_id: couponId }); 
    // Note: You need to create this RPC function in Supabase or use a simple update:
    // await supabase.from('coupons').update({ current_usage: current_usage + 1 }).eq('id', couponId)

    return { token, redemption: mapRedemption(data) };
  },

  async validateRedemption(rid: string, managerStoreId: string): Promise<boolean> {
    // 1. Fetch Redemption
    const { data: redemption, error: fetchError } = await supabase
      .from('redemptions')
      .select('*, coupons(store_id)')
      .eq('id', rid)
      .single();

    if (fetchError || !redemption) return false;

    // 2. Check Store Ownership
    // @ts-ignore
    if (redemption.coupons?.store_id !== managerStoreId) {
      throw new Error("Este cupom não pertence à sua loja.");
    }

    if (redemption.status !== 'PENDING') return false;

    // 3. Update Status
    const { error: updateError } = await supabase
      .from('redemptions')
      .update({ 
        status: 'USED', 
        validated_at: new Date().toISOString() 
        // validated_by: 'Manager' // Add column to schema if needed
      })
      .eq('id', rid);

    return !updateError;
  }
};
