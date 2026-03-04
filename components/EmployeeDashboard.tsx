import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Coupon, Store, User, Redemption, Badge } from '../types';
import { CouponCard } from './CouponCard';
import { Button } from './Button';
import { Modal } from './Modal';
import { CATEGORIES } from '../constants';
import { BackendService } from '../services/backend';
import { AIService } from '../services/ai';

const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const TicketIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const CopyIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BellIcon = () => (
  <svg className="w-6 h-6 text-text-muted group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Skeleton Component for Loading State
const CouponSkeleton = () => (
  <div className="glass-panel rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
    <div className="h-40 bg-surface animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <div className="flex justify-between mb-3">
         <div className="h-3 w-24 bg-surface rounded animate-pulse"></div>
      </div>
      <div className="h-6 w-3/4 bg-surface rounded mb-2 animate-pulse"></div>
      <div className="h-4 w-full bg-surface rounded mb-4 animate-pulse"></div>
      <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
         <div className="h-8 w-20 bg-surface rounded animate-pulse"></div>
         <div className="h-8 w-24 bg-surface rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

interface EmployeeDashboardProps {
  user: User;
  stores: Store[];
  coupons: Coupon[];
  redemptions: Redemption[];
  onRedeem: (couponId: string, token: string, redemptionId: string, updatedUser?: User) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ 
  user, stores, coupons, redemptions, onRedeem 
}) => {
  const [currentView, setCurrentView] = useState<'home' | 'my-coupons' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'expiring' | 'discount'>('newest');
  
  // Loading State
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Notification / Smart Push State
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [smartPush, setSmartPush] = useState<{ title: string, body: string } | null>(null);

  // Modal State
  const [selectedCoupon, setSelectedCoupon] = useState<{coupon: Coupon, store: Store} | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Security / Token State
  const [secureToken, setSecureToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingFeed(false), 800); // Faster mock load due to "Cache"
    
    // Trigger Smart Push after 3 seconds (Simulation)
    const pushTimer = setTimeout(() => {
       const suggestion = AIService.getSmartSuggestion(user);
       if (suggestion) {
         setSmartPush(suggestion);
         // Auto-hide after 8 seconds
         setTimeout(() => setSmartPush(null), 8000);
       }
    }, 3000);

    return () => { clearTimeout(timer); clearTimeout(pushTimer); };
  }, [user]);

  // Timer for QR Code Expiry
  useEffect(() => {
    let interval: any;
    if (tokenExpiry) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          // Token expired logic
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tokenExpiry]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const today = new Date();
    const alerts: Array<{id: string, title: string, message: string, daysLeft: number}> = [];

    redemptions.forEach(r => {
      if (r.status !== 'PENDING') return;
      const coupon = coupons.find(c => c.id === r.couponId);
      if (!coupon) return;
      
      const expiry = new Date(coupon.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays >= 0) {
        alerts.push({
          id: r.id,
          title: 'Cupom Expirando',
          message: `"${coupon.title}" expira em ${diffDays === 0 ? 'menos de 24h' : diffDays + ' dias'}.`,
          daysLeft: diffDays
        });
      }
    });

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [redemptions, coupons]);

  const filteredCoupons = useMemo(() => {
    let result = coupons.filter(coupon => {
      const store = stores.find(s => s.id === coupon.storeId);
      if (!store) return false;

      const matchesCategory = selectedCategory === 'Todos' || coupon.category === selectedCategory;
      const matchesSearch = 
        coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

    result = result.sort((a, b) => {
      // Prioritize Flash Deals (Dynamic Pricing)
      if (a.isFlashDeal && !b.isFlashDeal) return -1;
      if (!a.isFlashDeal && b.isFlashDeal) return 1;

      if (sortBy === 'expiring') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      if (sortBy === 'discount') return b.discountValue - a.discountValue;
      return 0; 
    });

    return result;
  }, [coupons, stores, selectedCategory, searchQuery, sortBy]);

  const handleOpenCoupon = (coupon: Coupon) => {
    const store = stores.find(s => s.id === coupon.storeId);
    if (store) {
      setSelectedCoupon({ coupon, store });
      setIsRedeeming(false);
      setSecureToken(null);
    }
  };

  const executeRedeem = async () => {
    if (!selectedCoupon) return;
    setIsRedeeming(true);
    try {
      // UX Micro-interaction: Haptic Feedback
      if (navigator.vibrate) navigator.vibrate(50); // Small bump on click

      // 1. Call Secure Backend
      const result = await BackendService.redeemCoupon(user.id, selectedCoupon.coupon.id);
      
      // 2. UX Micro-interaction: Success Vibration
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      
      // 3. Update UI
      const payload = JSON.parse(atob(result.token)).payload;
      setSecureToken(result.token);
      setTokenExpiry(payload.exp);
      
      // Fetch updated user to get the new badge if earned
      let updatedUser;
      if (result.badgeEarned) {
         updatedUser = BackendService.getUserById(user.id);
         setNewBadge(result.badgeEarned); // Trigger Celebration Modal
      }

      onRedeem(selectedCoupon.coupon.id, result.token, payload.rid, updatedUser);

      if ((window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#10b981', '#ffffff']
        });
      }
    } catch (e: any) {
      console.error(e);
      // UX: Error vibration
      if (navigator.vibrate) navigator.vibrate(300);
      alert(e.message || "Erro ao gerar token seguro");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative">
      
      {/* Smart Push Notification (Simulated) */}
      {smartPush && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in-up max-w-sm w-full">
           <div className="glass-panel p-4 rounded-xl shadow-2xl border-l-4 border-primary-500 relative bg-main/95 backdrop-blur-xl">
              <button onClick={() => setSmartPush(null)} className="absolute top-2 right-2 text-text-muted hover:text-white">✕</button>
              <div className="flex gap-3">
                 <div className="text-2xl">{smartPush.title.split(' ')[0]}</div>
                 <div>
                    <h4 className="font-bold text-text-main text-sm">{smartPush.title.substring(2)}</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{smartPush.body}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          {currentView !== 'home' && (
             <button 
               onClick={() => setCurrentView('home')} 
               className="p-2 rounded-full glass-panel text-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-colors"
               title="Voltar ao início"
             >
                <BackIcon />
             </button>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-text-main leading-tight">
              {currentView === 'home' ? `Olá, ${user.name.split(' ')[0]}!` : 'Minha Carteira'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-text-muted">
                 {currentView === 'home' ? 'Explore os descontos disponíveis.' : 'Seus cupons ativos e histórico.'}
               </p>
               {/* Gamification Badge Mini Display */}
               {user.badges && user.badges.length > 0 && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-colors" title="Ver minhas conquistas">
                    🏆 {user.badges.length} Conquista{user.badges.length !== 1 && 's'}
                 </span>
               )}
            </div>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-3 rounded-xl glass-panel transition-all duration-200 relative group ${showNotifications ? 'bg-primary-500/10 border-primary-500/50 text-primary-500' : 'hover:bg-surface text-text-muted'}`}
          >
            <BellIcon />
            {notifications.length > 0 && (
               <span className="absolute top-2.5 right-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-main"></span>
               </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-2xl shadow-xl p-0 z-50 animate-pop-in overflow-hidden ring-1 ring-black/5">
               <div className="p-4 border-b border-border bg-surface">
                 <h3 className="font-bold text-text-main text-sm">Notificações</h3>
               </div>
               {notifications.length === 0 ? (
                 <div className="p-8 text-center">
                    <p className="text-sm text-text-muted">Tudo limpo por aqui! ✨</p>
                 </div>
               ) : (
                 <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="flex gap-3 items-start p-4 hover:bg-surface transition-colors border-b border-border last:border-0 cursor-pointer"
                        onClick={() => {
                           const r = redemptions.find(x => x.id === notif.id);
                           if (r) setSelectedRedemption(r);
                           setShowNotifications(false);
                        }}
                      >
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.daysLeft <= 1 ? 'bg-red-500' : 'bg-orange-400'}`} />
                        <div>
                           <p className="text-sm font-bold text-text-main">{notif.title}</p>
                           <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {currentView === 'home' && (
         <div className="flex justify-center mb-8">
            <button 
              onClick={() => setCurrentView('my-coupons')}
              className="bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/30 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-xl hover:scale-[1.02] transition-all border border-white/20"
            >
              <TicketIcon />
              Ver Meus Resgates
            </button>
         </div>
      )}

      {currentView === 'home' ? (
        <>
          {/* Filters */}
          <div className="mb-8 sticky top-20 z-20 md:static animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary-500 transition-colors">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Busque por loja..."
                    className="block w-full pl-10 pr-3 py-3 glass-panel rounded-xl leading-5 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all glass-panel ${showFilters ? 'bg-surface border-primary-500 text-primary-500' : 'text-text-muted hover:bg-surface'}`}
                >
                  <FilterIcon />
                  <span className="font-medium text-sm">Filtros</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 glass-panel p-5 rounded-2xl shadow-lg animate-pop-in space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Ordenar Por</label>
                        <div className="flex flex-wrap gap-2">
                           {[
                             { id: 'newest', label: 'Mais Recentes' },
                             { id: 'expiring', label: 'Vai Expirar' },
                             { id: 'discount', label: 'Maior Desconto' }
                           ].map((opt) => (
                             <button 
                               key={opt.id}
                               onClick={() => setSortBy(opt.id as any)} 
                               className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${sortBy === opt.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface text-text-muted border-border hover:border-primary-500/50'}`}
                             >
                               {opt.label}
                             </button>
                           ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-2">Categoria</label>
                        <div className="relative">
                          <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface text-text-main"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                   </div>
                </div>
              )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {isLoadingFeed 
              ? Array.from({ length: 6 }).map((_, i) => <CouponSkeleton key={i} />)
              : filteredCoupons.map((coupon, idx) => {
                  const store = stores.find(s => s.id === coupon.storeId);
                  if (!store) return null;
                  const userRedemptionsCount = redemptions.filter(r => r.couponId === coupon.id).length;
                  const isRedeemed = userRedemptionsCount >= coupon.maxUsesPerUser;

                  return (
                    <div key={coupon.id} style={{ animationDelay: `${(idx * 50)}ms` }} className="animate-fade-in-up">
                      <CouponCard 
                        coupon={coupon} 
                        store={store} 
                        onClick={() => handleOpenCoupon(coupon)} 
                        isRedeemed={isRedeemed}
                      />
                    </div>
                  );
                })
            }
          </div>
        </>
      ) : (
        /* My Redemptions */
        <div className="max-w-2xl mx-auto animate-fade-in-up">
           <div className="space-y-4">
             {redemptions.length === 0 ? (
               <div className="text-center py-12 text-text-muted border-2 border-dashed border-border rounded-2xl glass-panel animate-pop-in">
                 <div className="text-4xl mb-4">✨</div>
                 <h3 className="text-lg font-bold text-text-main mb-2">Sua carteira está vazia</h3>
                 <p className="mb-6 max-w-xs mx-auto">Explore as ofertas em destaque e comece a economizar hoje mesmo.</p>
                 <Button onClick={() => setCurrentView('home')} className="mx-auto" variant="primary">
                   Explorar Ofertas
                 </Button>
               </div>
             ) : (
               redemptions.map(r => {
                  const coupon = coupons.find(c => c.id === r.couponId);
                  const store = stores.find(s => s.id === coupon?.storeId);
                  if(!coupon || !store) return null;
                  
                  const expiry = new Date(coupon.expiryDate);
                  const daysLeft = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isExpiring = r.status === 'PENDING' && daysLeft <= 7 && daysLeft >= 0;

                  return (
                    <div key={r.id} onClick={() => setSelectedRedemption(r)} className="glass-panel p-4 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-primary-500/50 transition-all group relative overflow-hidden">
                      {isExpiring && <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>}
                      <img src={store.logoUrl} className="w-12 h-12 object-contain rounded-lg border border-border bg-white p-1" alt={store.name} />
                      <div className="flex-1">
                        <h4 className="font-bold text-text-main group-hover:text-primary-500 transition-colors">{coupon.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-text-muted font-medium">{store.name}</span>
                          {isExpiring && (
                             <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-full">
                                <ClockIcon />
                                <span className="text-[10px] font-bold">Expira em {daysLeft} dias</span>
                             </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        r.status === 'PENDING' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                        r.status === 'USED' ? 'bg-surface text-text-muted border-border' :
                        'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {r.status === 'PENDING' ? 'Ativo' : r.status === 'USED' ? 'Usado' : 'Expirado'}
                      </span>
                    </div>
                  );
               })
             )}
           </div>
        </div>
      )}

      {/* Coupon Details Modal / Redeem Flow */}
      {selectedCoupon && (
        <Modal isOpen={!!selectedCoupon} onClose={() => setSelectedCoupon(null)}>
           <div className="h-48 relative">
              <img src={selectedCoupon.store.coverUrl} className="w-full h-full object-cover" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-3 text-white">
                 <div className="bg-white p-1 rounded-lg shadow-lg">
                   <img src={selectedCoupon.store.logoUrl} className="w-10 h-10 object-contain" alt="logo"/>
                 </div>
                 <div>
                   <p className="font-bold text-lg leading-none text-white">{selectedCoupon.store.name}</p>
                   <p className="text-xs opacity-80 mt-1 text-gray-200">{selectedCoupon.store.category}</p>
                 </div>
              </div>
           </div>
           <div className="p-6 bg-main">
              {!secureToken ? (
                <>
                  <h2 className="text-2xl font-bold text-text-main mb-2">{selectedCoupon.coupon.title}</h2>
                  <p className="text-text-muted mb-6 leading-relaxed">{selectedCoupon.coupon.description}</p>
                  
                  <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Regras</h4>
                    <ul className="text-sm text-text-main space-y-2">
                      <li className="flex items-start gap-2">
                           <span className="text-primary-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                           <span>Limite de uso: <strong>{selectedCoupon.coupon.maxUsesPerUser} por pessoa</strong>.</span>
                      </li>
                      {selectedCoupon.coupon.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2">
                           <span className="text-primary-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"></span>
                           <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(() => {
                    const userRedemptionsCount = redemptions.filter(r => r.couponId === selectedCoupon.coupon.id).length;
                    const isLimitReached = userRedemptionsCount >= selectedCoupon.coupon.maxUsesPerUser;

                    return (
                       <Button fullWidth onClick={executeRedeem} disabled={isRedeeming || isLimitReached}>
                        {isRedeeming ? <><Spinner /> Gerando Token Seguro...</> : isLimitReached ? 'Limite de Uso Atingido' : 'Gerar QR Code'}
                      </Button>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-6 animate-pop-in">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-text-muted uppercase">Token de Validação</span>
                      <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                         <ClockIcon />
                         <span className="text-xs font-bold font-mono">{formatTime(timeLeft)}</span>
                      </div>
                   </div>

                   {/* Progress Bar for Timer */}
                   <div className="w-full bg-surface rounded-full h-1.5 mb-6 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-1000 ease-linear" 
                        style={{ width: `${(timeLeft / 300) * 100}%` }}
                      ></div>
                   </div>

                   <div className="bg-white p-4 rounded-xl inline-block shadow-lg border-2 border-primary-500 mb-6 relative">
                      {timeLeft === 0 ? (
                        <div className="w-40 h-40 bg-gray-100 flex items-center justify-center flex-col text-gray-400">
                           <span className="font-bold">EXPIRADO</span>
                           <button onClick={() => setSecureToken(null)} className="text-xs underline mt-2 text-primary-500">Gerar Novo</button>
                        </div>
                      ) : (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(secureToken)}`} 
                          alt="QR Code Seguro" 
                          className="w-40 h-40" 
                        />
                      )}
                      
                      {/* Security Hologram Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 pointer-events-none rounded-xl" style={{ mixBlendMode: 'overlay' }}></div>
                   </div>
                   
                   <p className="text-text-muted mb-6 text-sm">Apresente este QR Code ao gerente. Ele expira em 5 minutos para sua segurança.</p>
                   
                   <Button variant="secondary" fullWidth onClick={() => setSelectedCoupon(null)}>Fechar</Button>
                </div>
              )}
           </div>
        </Modal>
      )}

      {/* Redemption Status Modal (History) */}
      {selectedRedemption && (
         <Modal isOpen={!!selectedRedemption} onClose={() => setSelectedRedemption(null)}>
            {(() => {
               const coupon = coupons.find(c => c.id === selectedRedemption.couponId);
               const store = stores.find(s => s.id === coupon?.storeId);
               if (!coupon || !store) return null;

               const isUsed = selectedRedemption.status === 'USED';
               const isExpired = selectedRedemption.status === 'EXPIRED';
               const statusColor = isUsed ? 'text-text-muted bg-surface' : isExpired ? 'text-red-400 bg-red-500/10' : 'text-green-500 bg-green-500/10';

               return (
                 <div className="p-0 bg-main">
                    <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-6 text-white text-center relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                       <h2 className="text-xl font-bold relative z-10">{store.name}</h2>
                       <p className="text-white/80 text-sm relative z-10 font-medium">{coupon.title}</p>
                    </div>
                    
                    <div className="p-6">
                       <div className="flex justify-center mb-6">
                         <div className="p-3 bg-white border border-border rounded-xl shadow-lg relative">
                            {isUsed || isExpired ? (
                               <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                                  <span className="text-gray-400 font-bold opacity-50 text-xl rotate-45 border-4 border-gray-300 p-2 rounded-lg">
                                    {isUsed ? 'UTILIZADO' : 'EXPIRADO'}
                                  </span>
                               </div>
                            ) : (
                               <>
                                 <img 
                                   src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedRedemption.code)}`} 
                                   alt="QR Code" 
                                   className="w-40 h-40" 
                                 />
                                 <div className="absolute top-0 right-0 p-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                                 </div>
                               </>
                            )}
                         </div>
                       </div>

                       <div className="flex items-center gap-2 mb-6">
                          <div className="flex-1 bg-surface border border-border rounded-lg py-3 px-4 text-center overflow-hidden">
                             <span className="font-mono text-xs sm:text-sm font-bold text-text-main tracking-wider truncate block">{selectedRedemption.code.substring(0, 12)}...</span>
                          </div>
                          <button 
                            onClick={() => handleCopyCode(selectedRedemption.code)}
                            className="bg-surface text-primary-500 p-3.5 rounded-lg hover:bg-surface transition-colors border border-border hover:border-primary-500/50"
                            title="Copiar código"
                          >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                          </button>
                       </div>

                       <div className="space-y-3 text-sm border-t border-border pt-4">
                          <div className="flex justify-between">
                             <span className="text-text-muted">Status</span>
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColor}`}>
                               {selectedRedemption.status === 'PENDING' ? 'Disponível' : selectedRedemption.status === 'USED' ? 'Utilizado' : 'Expirado'}
                             </span>
                          </div>
                          
                          {isUsed ? (
                             <>
                               <div className="flex justify-between">
                                  <span className="text-text-muted">Validado por</span>
                                  <span className="font-medium text-text-main">{selectedRedemption.validatedBy || 'Loja'}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span className="text-text-muted">Data de Uso</span>
                                  <span className="font-medium text-text-main">
                                    {selectedRedemption.validatedAt ? new Date(selectedRedemption.validatedAt).toLocaleString('pt-BR') : '-'}
                                  </span>
                               </div>
                             </>
                          ) : (
                             <>
                               <div className="flex justify-between">
                                  <span className="text-text-muted">Gerado em</span>
                                  <span className="font-medium text-text-main">{new Date(selectedRedemption.redeemedAt).toLocaleDateString('pt-BR')}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span className="text-text-muted">Válido até</span>
                                  <span className="font-medium text-red-400">{new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}</span>
                               </div>
                             </>
                          )}
                       </div>

                       <div className="mt-8">
                         <Button fullWidth variant="secondary" onClick={() => setSelectedRedemption(null)}>Fechar</Button>
                       </div>
                    </div>
                 </div>
               );
            })()}
         </Modal>
      )}

      {/* New Badge Celebration Modal */}
      {newBadge && (
         <Modal isOpen={!!newBadge} onClose={() => setNewBadge(null)}>
            <div className="p-6 bg-main flex flex-col items-center text-center relative overflow-hidden">
               {/* Shine Effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none animate-pulse"></div>
               
               <div className="w-24 h-24 text-6xl mb-4 animate-[blob_3s_infinite] filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                  {newBadge.icon}
               </div>
               
               <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                  Conquista Desbloqueada!
               </h2>
               
               <h3 className="text-xl font-bold text-text-main mb-2">{newBadge.name}</h3>
               <p className="text-text-muted mb-6">{newBadge.description}</p>
               
               <Button onClick={() => setNewBadge(null)} className="relative z-10 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 border-none">
                  Incrível!
               </Button>
            </div>
         </Modal>
      )}
    </div>
  );
};