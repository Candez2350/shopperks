import React, { useState, useEffect } from 'react';
import { Coupon, Store, User, UserRole, Redemption } from './types';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileModal } from './components/ProfileModal';
import { BackendService } from './services/backend';
import { AIService } from './services/ai';

// Icons
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

type Theme = 'dark' | 'emerald' | 'indigo';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  
  // State is now initially empty, populated by BackendService
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial Data Load (Simulating App Launch)
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch coupons with Caching via Backend Service
      const fetchedCoupons = await BackendService.getCoupons();
      // 2. Enhance with AI (Dynamic Pricing)
      const smartCoupons = AIService.enrichCouponsWithDynamicPricing(fetchedCoupons);
      setCoupons(smartCoupons);
      
      setStores(BackendService.getStores());
      setUsers(BackendService.getUsers());
    };
    initData();
  }, []);

  const handleLogin = (identifier: string) => {
    const id = identifier.toLowerCase();
    const foundUser = users.find(u => u.email === id);
    
    if (foundUser) {
      setUser(foundUser);
      // Load user specific redemptions secureley
      // Note: In real app this would be an API call with Auth Token
      // Here we simulate fetching 'my' redemptions via the service
      BackendService.getUserRedemptions(foundUser.id, foundUser.id, foundUser.role)
        .then(data => setRedemptions(data))
        .catch(err => console.error(err));
    }
  };

  const handleLogout = () => setUser(null);

  // --- Actions ---
  // Note: These handlers mimic state updates for the UI, 
  // but in a real app the BackendService would persist changes to DB.

  // Store Management Actions
  const handleAddStore = (newStoreData: Omit<Store, 'id'>) => {
    const newStore: Store = { ...newStoreData, id: `s${Date.now()}` };
    setStores([...stores, newStore]);
  };

  const handleUpdateStore = (updatedStore: Store) => {
    setStores(stores.map(s => s.id === updatedStore.id ? updatedStore : s));
  };

  const handleDeleteStore = (storeId: string) => {
    setStores(stores.filter(s => s.id !== storeId));
  };

  // User Management Actions
  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = { ...newUserData, id: `u${Date.now()}` };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) {
       setUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleProfileUpdate = (data: Partial<User> & { password?: string }) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    delete (updatedUser as any).password;
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    setUser(updatedUser);
  };

  const handleCreateCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...couponData, id: `new_${Date.now()}` };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // The redeeming process is now handled via BackendService in EmployeeDashboard
  // This handler just updates the LOCAL state to reflect the change in the UI
  const handleRedeemUpdate = (couponId: string, token: string, redemptionId: string, updatedUser?: User) => {
    if (user) {
      setRedemptions(prev => [{
        id: redemptionId, 
        couponId,
        userId: user.id,
        code: token,
        status: 'PENDING',
        redeemedAt: new Date().toISOString()
      }, ...prev]);

      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  const handleValidateRedemption = (redemptionId: string): boolean => {
    const redemption = redemptions.find(r => r.id === redemptionId && r.status === 'PENDING');
    
    if (redemption) {
      setRedemptions(prev => prev.map(r => 
        r.id === redemption.id ? { ...r, status: 'USED', validatedAt: new Date().toISOString(), validatedBy: user?.name } : r
      ));
      return true;
    }
    return false;
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden relative">
      {/* Ambient Background Blobs for Glassmorphism */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
         <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2s' }}></div>
         <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Global Navbar */}
        <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-6xl z-40 rounded-2xl shadow-lg mt-4 mb-4">
          <div className="px-6 h-16 flex justify-between items-center">
             <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                {/* Logo Enhancement: Added shadow and border for better visibility on light themes */}
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md border border-white/20">
                    <span className="drop-shadow-md">SP</span>
                </div>
                <span className="font-bold text-text-main tracking-tight hidden sm:block">ShopPerks</span>
             </div>
             <div className="flex items-center gap-4">
                {/* Theme Switcher */}
                <div className="relative">
                  <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="p-2 rounded-full text-text-muted hover:text-primary-500 hover:bg-surface/50 transition-colors"
                  >
                    {theme === 'dark' ? <MoonIcon /> : theme === 'emerald' ? <SunIcon /> : <SparklesIcon />}
                  </button>
                  {showThemeMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl shadow-xl overflow-hidden animate-pop-in">
                       <button onClick={() => { setTheme('dark'); setShowThemeMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-primary-500/10 ${theme === 'dark' ? 'text-primary-500 font-bold' : 'text-text-main'}`}>
                          <div className="w-3 h-3 rounded-full bg-[#18181b] border border-gray-600"></div> Dark Gunmetal
                       </button>
                       <button onClick={() => { setTheme('emerald'); setShowThemeMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-primary-500/10 ${theme === 'emerald' ? 'text-primary-500 font-bold' : 'text-text-main'}`}>
                          <div className="w-3 h-3 rounded-full bg-[#00DC82]"></div> Emerald Light
                       </button>
                       <button onClick={() => { setTheme('indigo'); setShowThemeMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-primary-500/10 ${theme === 'indigo' ? 'text-primary-500 font-bold' : 'text-text-main'}`}>
                          <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div> Indigo Light
                       </button>
                    </div>
                  )}
                </div>

                <span className="text-xs font-semibold text-primary-500 hidden sm:block bg-primary-900/10 px-3 py-1 rounded-full border border-primary-500/20 uppercase tracking-wide">
                   {user.role === 'ADMIN' ? 'Admin' : user.role === 'MANAGER' ? 'Gerente' : 'Funcionário'}
                </span>
                
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 group">
                     <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-9 h-9 rounded-full border-2 border-surface shadow-sm transition-transform group-hover:scale-105 group-hover:border-primary-500" alt="avatar" />
                  </button>
                  <button onClick={handleLogout} className="text-sm font-semibold text-text-muted hover:text-red-400 transition-colors ml-2" title="Sair">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
             </div>
          </div>
        </nav>

        {user.role === UserRole.EMPLOYEE && (
          <EmployeeDashboard 
            user={user} 
            stores={stores} 
            coupons={coupons} 
            redemptions={redemptions.filter(r => r.userId === user.id)}
            onRedeem={handleRedeemUpdate} 
          />
        )}

        {user.role === UserRole.MANAGER && user.storeId && (
          <ManagerDashboard 
            user={user}
            store={stores.find(s => s.id === user.storeId)!}
            coupons={coupons}
            redemptions={redemptions}
            onCreateCoupon={handleCreateCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onValidateRedemption={handleValidateRedemption}
          />
        )}

        {user.role === UserRole.ADMIN && (
          <AdminDashboard 
            stores={stores} 
            users={users} 
            coupons={coupons}
            redemptions={redemptions}
            onAddStore={handleAddStore}
            onUpdateStore={handleUpdateStore}
            onDeleteStore={handleDeleteStore}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* Profile Modal */}
        {user && (
          <ProfileModal 
            user={user} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onUpdateUser={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
}