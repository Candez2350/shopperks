import { useState, useEffect } from 'react';
import { Coupon, Store, User, UserRole, Redemption } from './types';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileModal } from './components/ProfileModal';
import { BackendService } from './services/backend';
import { supabase } from './services/supabase';

// Icons
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

type Theme = 'dark' | 'emerald' | 'indigo';

const LoadingScreen = () => (
  <div className="min-h-screen bg-main flex items-center justify-center text-text-main">
    <div className="flex items-center gap-2">
      <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="font-semibold">Carregando Ecossistema ShopPerks...</span>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('indigo');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  
  // Global Data State
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

  // Auth Listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile from our public 'users' table
        const profile = await BackendService.getUserById(session.user.id);
        setUser(profile as User);
      } else {
        setUser(null);
      }
      setSessionLoaded(true);
    });

    // Initial session check
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const profile = await BackendService.getUserById(data.session.user.id);
        setUser(profile as User);
      }
      setSessionLoaded(true);
    };
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Initial Data Load from Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedCoupons, fetchedStores, fetchedUsers] = await Promise.all([
          BackendService.getCoupons(),
          BackendService.getStores(),
          BackendService.getUsers(),
        ]);
        
        setCoupons(fetchedCoupons);
        setStores(fetchedStores as Store[]);
        setUsers(fetchedUsers as User[]);

      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleLogin = async (email: string, password?: string) => {
    if (!password) return { error: { message: "Senha é obrigatória." }};
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Actions ---
  const handleAddStore = async (newStoreData: Omit<Store, 'id'>) => {
    try {
      const newStore = await BackendService.addStore(newStoreData);
      setStores(current => [...current, newStore]);
    } catch (error) { console.error("Failed to add store:", error); }
  };

  const handleUpdateStore = async (updatedStoreData: Store) => {
    try {
      const updatedStore = await BackendService.updateStore(updatedStoreData);
      setStores(current => current.map(s => s.id === updatedStore.id ? updatedStore : s));
    } catch (error) { console.error("Failed to update store:", error); }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await BackendService.deleteStore(storeId);
      setStores(current => current.filter(s => s.id !== storeId));
    } catch (error) { console.error("Failed to delete store:", error); }
  };

  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    try {
      const newUser = await BackendService.addUser(newUserData);
      setUsers(current => [...current, newUser]);
    } catch (error) { console.error("Failed to add user:", error); }
  };

  const handleUpdateUser = async (updatedUserData: User) => {
    try {
      const updatedUser = await BackendService.updateUser(updatedUserData);
      setUsers(current => current.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
      }
    } catch (error) { console.error("Failed to update user:", error); }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await BackendService.deleteUser(userId);
      setUsers(current => current.filter(u => u.id !== userId));
    } catch (error) { console.error("Failed to delete user:", error); }
  };

  const handleProfileUpdate = async (data: Partial<User>) => {
    if (!user) return;
    // TODO: Add password update logic via supabase.auth.updateUser
    const updatedUserData = { ...user, ...data };
    await handleUpdateUser(updatedUserData as User);
  };

  const handleCreateCoupon = async (couponData: Omit<Coupon, 'id'>) => {
    try {
      const newCoupon = await BackendService.createCoupon(couponData);
      setCoupons(prev => [newCoupon, ...prev]);
    } catch (error) { console.error("Failed to create coupon:", error); }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await BackendService.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (error) { console.error("Failed to delete coupon:", error); }
  };



  if (isLoading || !sessionLoaded) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden relative">
      {/* Ambient Background Blobs */}
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
