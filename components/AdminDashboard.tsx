import React, { useState, useMemo } from 'react';
import { Store, User, UserRole, Redemption, Coupon } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { CATEGORIES } from '../constants';

interface AdminDashboardProps {
  stores: Store[];
  users: User[];
  coupons: Coupon[];
  redemptions: Redemption[];
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onUpdateStore: (store: Store) => void;
  onDeleteStore: (storeId: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

// Icons
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const StoreIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  stores, users, coupons, redemptions, onAddStore, onUpdateStore, onDeleteStore, onAddUser, onUpdateUser, onDeleteUser 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Store Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeFormData, setStoreFormData] = useState<Partial<Store>>({ name: '', category: 'Moda', floor: '', logoUrl: '', coverUrl: '' });
  
  // Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{ type: 'store' | 'user', id: string, name: string } | null>(null);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({ name: '', email: '', role: UserRole.EMPLOYEE, storeId: '' });

  // Filtering
  const filteredStores = useMemo(() => {
    return stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [stores, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  // Global Stats Logic
  const globalStats = useMemo(() => {
     const totalRedemptions = redemptions.length;
     const activeUsersCount = new Set(redemptions.map(r => r.userId)).size;
     
     // Calculate top store based on redemption count
     const topStoreId = stores.reduce((acc, store) => {
         const storeCoupons = coupons.filter(c => c.storeId === store.id);
         const count = storeCoupons.reduce((sum, c) => sum + redemptions.filter(r => r.couponId === c.id).length, 0);
         return count > acc.count ? { id: store.id, count } : acc;
     }, { id: '', count: 0 }).id;
     
     const topStore = stores.find(s => s.id === topStoreId);

     // Category Distribution
     const catDist = CATEGORIES.filter(c => c !== 'Todos').map(cat => ({
       name: cat,
       count: stores.filter(s => s.category === cat).length
     }));

     return { totalRedemptions, activeUsersCount, topStore, catDist };
  }, [stores, users, coupons, redemptions]);

  // Handlers - Stores
  const handleOpenAddStore = () => {
    setEditingStore(null);
    setStoreFormData({ name: '', category: 'Moda', floor: '', logoUrl: '', coverUrl: '' });
    setIsStoreModalOpen(true);
  };

  const handleOpenEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreFormData(store);
    setIsStoreModalOpen(true);
  };

  const handleSubmitStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      onUpdateStore({ ...editingStore, ...storeFormData } as Store);
    } else {
      onAddStore(storeFormData as Omit<Store, 'id'>);
    }
    setIsStoreModalOpen(false);
  };

  // Handlers - Users
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: UserRole.EMPLOYEE, storeId: stores[0]?.id || '' });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData(user);
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
       ...userFormData,
       // If role is admin, clear storeId
       storeId: userFormData.role === UserRole.ADMIN ? undefined : userFormData.storeId
    };

    if (editingUser) {
      onUpdateUser({ ...editingUser, ...payload } as User);
    } else {
      onAddUser(payload as Omit<User, 'id'>);
    }
    setIsUserModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'store') {
      onDeleteStore(itemToDelete.id);
    } else {
      onDeleteUser(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  const inputClasses = "input-base w-full p-3 rounded-xl transition-all focus:outline-none";
  const selectClasses = "input-base w-full p-3 rounded-xl transition-all appearance-none focus:outline-none";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold text-text-main">Painel do Administrador</h1>
            <p className="text-text-muted mt-1">Gerencie a estrutura e monitore o ecossistema.</p>
         </div>
         <div className="flex bg-surface/50 rounded-xl p-1.5 border border-border shadow-sm">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-900/30 text-primary-500 shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'stores' ? 'bg-primary-900/30 text-primary-500 shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
            >
              <StoreIcon /> Lojas
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary-900/30 text-primary-500 shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
            >
              <UserIcon /> Usuários
            </button>
         </div>
       </div>

       {/* Search Bar (Shared for Stores and Users tabs) */}
       {activeTab !== 'overview' && (
         <div className="mb-6 flex gap-4 animate-fade-in">
           <div className="relative flex-1 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <SearchIcon />
             </div>
             <input
               type="text"
               placeholder={activeTab === 'stores' ? "Buscar loja..." : "Buscar usuário..."}
               className="input-base block w-full pl-10 pr-3 py-3 rounded-xl leading-5 transition-all shadow-sm focus:outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <Button onClick={activeTab === 'stores' ? handleOpenAddStore : handleOpenAddUser} className="shrink-0">
             {activeTab === 'stores' ? '+ Nova Loja' : '+ Novo Usuário'}
           </Button>
         </div>
       )}

       {activeTab === 'overview' && (
         <div className="space-y-8 animate-fade-in-up">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start">
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Total de Lojas</p>
                    <div className="p-2 bg-surface rounded-lg text-text-muted"><StoreIcon /></div>
                 </div>
                 <p className="text-4xl font-extrabold text-text-main mt-4">{stores.length}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start">
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Usuários</p>
                    <div className="p-2 bg-surface rounded-lg text-text-muted"><UserIcon /></div>
                 </div>
                 <p className="text-4xl font-extrabold text-text-main mt-4">{users.length}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start">
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Total Resgates</p>
                    <div className="p-2 bg-primary-900/20 text-primary-500 rounded-lg">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                 </div>
                 <p className="text-4xl font-extrabold text-text-main mt-4">{globalStats.totalRedemptions}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <StoreIcon />
                 </div>
                 <div className="flex justify-between items-start relative z-10">
                    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">Loja Top Performance</p>
                    <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                 </div>
                 <p className="text-2xl font-bold text-text-main mt-4 truncate">{globalStats.topStore?.name || 'N/A'}</p>
                 <p className="text-xs text-text-muted">Maior volume de resgates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Category Distribution Chart */}
               <div className="glass-panel p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-bold text-text-main mb-6">Distribuição de Lojas</h3>
                  <div className="space-y-4">
                     {globalStats.catDist.map((cat) => {
                       const max = Math.max(...globalStats.catDist.map(c => c.count));
                       const percent = (cat.count / (max || 1)) * 100;
                       return (
                         <div key={cat.name}>
                            <div className="flex justify-between text-sm mb-1 text-text-muted">
                               <span>{cat.name}</span>
                               <span className="font-bold">{cat.count}</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-3">
                               <div 
                                 className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500" 
                                 style={{ width: `${percent}%` }}
                               ></div>
                            </div>
                         </div>
                       )
                     })}
                  </div>
               </div>

               {/* Recent Activity Feed */}
               <div className="glass-panel p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-bold text-text-main mb-6">Atividade Recente do Sistema</h3>
                  <div className="space-y-4">
                     {redemptions.slice().sort((a,b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()).slice(0, 5).map(r => {
                        const coupon = coupons.find(c => c.id === r.couponId);
                        const user = users.find(u => u.id === r.userId);
                        const store = stores.find(s => s.id === coupon?.storeId);
                        
                        if (!coupon || !user || !store) return null;

                        return (
                          <div key={r.id} className="flex gap-4 items-start p-3 bg-surface/30 rounded-xl border border-border animate-fade-in">
                             <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${r.status === 'USED' ? 'bg-green-500' : 'bg-primary-500'}`} />
                             <div>
                                <p className="text-sm text-text-muted">
                                   <span className="font-bold text-text-main">{user.name}</span> resgatou <span className="text-primary-500">{coupon.title}</span> em <span className="font-medium text-text-main">{store.name}</span>.
                                </p>
                                <p className="text-xs text-text-muted mt-1">{new Date(r.redeemedAt).toLocaleString('pt-BR')}</p>
                             </div>
                          </div>
                        );
                     })}
                     {redemptions.length === 0 && <p className="text-text-muted">Sem atividade recente.</p>}
                  </div>
               </div>
            </div>
         </div>
       )}

       {activeTab === 'stores' && (
         <div className="animate-fade-in-up space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredStores.map(store => (
                  <div key={store.id} className="glass-panel rounded-2xl p-5 shadow-sm hover:shadow-primary-500/10 hover:border-primary-500/50 transition-all group flex flex-col">
                     <div className="flex items-center gap-4 mb-4">
                        <img src={store.logoUrl} className="w-14 h-14 rounded-xl object-contain bg-white border border-border p-1" alt={store.name} />
                        <div>
                           <h3 className="font-bold text-text-main text-lg leading-tight group-hover:text-primary-500 transition-colors">{store.name}</h3>
                           <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-surface text-text-muted">
                             {store.category}
                           </span>
                        </div>
                     </div>
                     <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-text-muted font-medium">Piso {store.floor}</span>
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenEditStore(store)} className="p-2 text-primary-500 hover:bg-surface rounded-lg transition-colors" title="Editar">
                              <EditIcon />
                           </button>
                           <button onClick={() => setItemToDelete({ type: 'store', id: store.id, name: store.name })} className="p-2 text-red-400 hover:bg-surface rounded-lg transition-colors" title="Remover">
                              <TrashIcon />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            {filteredStores.length === 0 && <div className="text-center py-12 text-text-muted">Nenhuma loja encontrada.</div>}
         </div>
       )}

       {activeTab === 'users' && (
         <div className="animate-fade-in-up">
            <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-surface/50 text-text-muted text-xs uppercase font-semibold">
                       <tr>
                          <th className="px-6 py-4">Usuário</th>
                          <th className="px-6 py-4">Função</th>
                          <th className="px-6 py-4">Loja Associada</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                       {filteredUsers.map(u => {
                          const userStore = stores.find(s => s.id === u.storeId);
                          return (
                            <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-xs border border-primary-500/20">
                                       {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : u.name.substring(0,2).toUpperCase()}
                                     </div>
                                     <div>
                                       <p className="font-bold text-text-main">{u.name}</p>
                                       <p className="text-text-muted text-xs">{u.email}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                    u.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-500' :
                                    u.role === UserRole.MANAGER ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-green-500/10 text-green-500'
                                  }`}>
                                    {u.role === UserRole.ADMIN ? 'Administrador' : u.role === UserRole.MANAGER ? 'Gerente' : 'Funcionário'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-text-muted">
                                  {userStore ? (
                                    <div className="flex items-center gap-2">
                                       <img src={userStore.logoUrl} className="w-5 h-5 rounded object-contain bg-white" />
                                       <span>{userStore.name}</span>
                                    </div>
                                  ) : '-'}
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => handleOpenEditUser(u)} className="p-2 text-primary-500 hover:bg-surface rounded-lg transition-colors">
                                        <EditIcon />
                                     </button>
                                     <button onClick={() => setItemToDelete({ type: 'user', id: u.id, name: u.name })} className="p-2 text-red-400 hover:bg-surface rounded-lg transition-colors">
                                        <TrashIcon />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
       )}

       {/* Store Modal */}
       <Modal isOpen={isStoreModalOpen} onClose={() => setIsStoreModalOpen(false)}>
          <div className="p-6 bg-main">
             <h2 className="text-xl font-bold mb-6 text-text-main">{editingStore ? 'Editar Loja' : 'Nova Loja'}</h2>
             <form onSubmit={handleSubmitStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Nome da Loja</label>
                  <input required className={inputClasses} value={storeFormData.name} onChange={e => setStoreFormData({...storeFormData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-text-muted mb-1">Categoria</label>
                     <div className="relative">
                       <select className={selectClasses} value={storeFormData.category} onChange={e => setStoreFormData({...storeFormData, category: e.target.value})}>
                          {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <ChevronDownIcon />
                       </div>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-text-muted mb-1">Piso</label>
                     <input required className={inputClasses} value={storeFormData.floor} onChange={e => setStoreFormData({...storeFormData, floor: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">URL do Logo</label>
                  <input required className={inputClasses} value={storeFormData.logoUrl} onChange={e => setStoreFormData({...storeFormData, logoUrl: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">URL da Capa</label>
                  <input required className={inputClasses} value={storeFormData.coverUrl} onChange={e => setStoreFormData({...storeFormData, coverUrl: e.target.value})} placeholder="https://..." />
                </div>
                <div className="pt-4">
                   <Button fullWidth type="submit">{editingStore ? 'Salvar Alterações' : 'Criar Loja'}</Button>
                </div>
             </form>
          </div>
       </Modal>

       {/* User Modal */}
       <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)}>
          <div className="p-6 bg-main">
             <h2 className="text-xl font-bold mb-6 text-text-main">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
             <form onSubmit={handleSubmitUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Nome Completo</label>
                  <input required className={inputClasses} value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">E-mail</label>
                  <input type="email" required className={inputClasses} value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Função</label>
                  <div className="relative">
                    <select className={selectClasses} value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})}>
                       <option value={UserRole.EMPLOYEE}>Funcionário</option>
                       <option value={UserRole.MANAGER}>Gerente</option>
                       <option value={UserRole.ADMIN}>Administrador</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                       <ChevronDownIcon />
                    </div>
                  </div>
                </div>
                {userFormData.role !== UserRole.ADMIN && (
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Loja Associada</label>
                    <div className="relative">
                      <select className={selectClasses} value={userFormData.storeId} onChange={e => setUserFormData({...userFormData, storeId: e.target.value})}>
                         {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                         <ChevronDownIcon />
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-4">
                   <Button fullWidth type="submit">{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</Button>
                </div>
             </form>
          </div>
       </Modal>

       {/* Delete Confirmation Modal */}
       <ConfirmationModal
         isOpen={!!itemToDelete}
         onClose={() => setItemToDelete(null)}
         onConfirm={handleConfirmDelete}
         title={`Excluir ${itemToDelete?.type === 'store' ? 'Loja' : 'Usuário'}`}
         message={`Tem certeza que deseja excluir "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
         confirmText="Sim, excluir"
       />
    </div>
  );
};