import { useState, useEffect } from 'react';
import { Coupon, Store, User, UserRole, Redemption } from './types';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileModal } from './components/ProfileModal';
import { BackendService } from './services/backend';
import { AIService } from './services/ai';

// Icons (MoonIcon, SunIcon, SparklesIcon remain the same...)
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

type Theme = 'dark' | 'emerald' | 'indigo';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  
  // State populated by BackendService
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Data from Supabase
  const loadData = async () => {
    try {
      const [fetchedCoupons, fetchedStores, fetchedUsers, fetchedRedemptions] = await Promise.all([
        BackendService.getCoupons(),
        BackendService.getStores(),
        BackendService.getUsers(),
        BackendService.getRedemptions() // Admin needs all, others filtered later
      ]);
      
      const smartCoupons = AIService.enrichCouponsWithDynamicPricing(fetchedCoupons);
      setCoupons(smartCoupons);
      setStores(fetchedStores);
      setUsers(fetchedUsers);
      setRedemptions(fetchedRedemptions);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = async (identifier: string) => {
    // For now, we simulate login by finding the user in the fetched list
    // In a real scenario, you'd use supabase.auth.signInWithPassword
    const id = identifier.toLowerCase();
    const foundUser = users.find(u => u.email === id);
    
    if (foundUser) {
      setUser(foundUser);
      // Refresh redemptions for this user specifically if needed
      if (foundUser.role !== UserRole.ADMIN) {
         const myRedemptions = await BackendService.getUserRedemptions(foundUser.id, foundUser.id, foundUser.role);
         setRedemptions(myRedemptions);
      }
    } else {
      alert("Usuário não encontrado. Tente os emails de teste no README.");
    }
  };

  const handleLogout = () => setUser(null);

  // --- CRUD Actions (Now Async) ---

  const handleAddStore = async (newStoreData: Omit<Store, 'id'>) => {
    try {
      const newStore = await BackendService.createStore(newStoreData);
      setStores(prev => [...prev, newStore]);
    } catch (e) { alert("Erro ao criar loja"); }
  };

  const handleUpdateStore = async (updatedStore: Store) => {
    try {
      const saved = await BackendService.updateStore(updatedStore);
      setStores(prev => prev.map(s => s.id === saved.id ? saved : s));
    } catch (e) { alert("Erro ao atualizar loja"); }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await BackendService.deleteStore(storeId);
      setStores(prev => prev.filter(s => s.id !== storeId));
    } catch (e) { alert("Erro ao excluir loja"); }
  };

  const handleAddUser = async (newUserData: Omit<User, 'id'>, password?: string) => {
    try {
      const newUser = await BackendService.createUser(newUserData, password);
      setUsers(prev => [...prev, newUser]);
    } catch (error: any) {
      alert(`Erro ao criar usuário: ${error.message}`);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const saved = await BackendService.updateUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
      if (user && user.id === saved.id) setUser(saved);
    } catch (e) { alert("Erro ao atualizar usuário"); }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await BackendService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) { alert("Erro ao excluir usuário"); }
  };

  const handleProfileUpdate = async (data: Partial<User> & { password?: string }) => {
    if (!user) return;
    try {
      const updated = await BackendService.updateUser({ ...user, ...data });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setUser(updated);
    } catch (e) { alert("Erro ao atualizar perfil"); }
  };

  const handleCreateCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    try {
      const newCoupon = await BackendService.createCoupon(couponData);
      setCoupons(prev => [newCoupon, ...prev]);
    } catch (e) { alert("Erro ao criar cupom"); }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await BackendService.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (e) { alert("Erro ao excluir cupom"); }
  };

  const handleRedeemUpdate = (couponId: string, token: string, redemptionId: string, updatedUser?: User) => {
    // Optimistic update for UI responsiveness
    if (user) {
      const newRedemption: Redemption = {
        id: redemptionId, 
        couponId,
        userId: user.id,
        code: token,
        status: 'PENDING',
        redeemedAt: new Date().toISOString()
      };
      setRedemptions(prev => [newRedemption, ...prev]);
      if (updatedUser) setUser(updatedUser);
    }
  };

  const handleValidateRedemption = (redemptionId: string): boolean => {
    // Optimistic update
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
    // ... (Rest of the JSX remains the same, passing the new async handlers)
    <div className="min-h-screen font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden relative">
      {/* ... Background ... */}
      <div className="relative z-10">
        {/* ... Navbar ... */}
        <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-6xl z-40 rounded-2xl shadow-lg mt-4 mb-4">
           {/* ... Navbar Content ... */}
           <div className="px-6 h-16 flex justify-between items-center">
             {/* ... Logo & Theme Switcher ... */}
             <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md border border-white/20">
                    <span className="drop-shadow-md">SP</span>
                </div>
                <span className="font-bold text-text-main tracking-tight hidden sm:block">ShopPerks</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="relative">
                  <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="p-2 rounded-full text-text-muted hover:text-primary-500 hover:bg-surface/50 transition-colors">
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
