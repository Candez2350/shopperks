import React, { useState, useEffect, useMemo } from 'react';
import { User, Store, Coupon, Redemption } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { SecurityService } from '../services/security';

interface ManagerDashboardProps {
  user: User;
  store: Store;
  coupons: Coupon[];
  redemptions: Redemption[];
  onCreateCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  onDeleteCoupon: (couponId: string) => void;
  onValidateRedemption: (code: string) => boolean;
}

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ListIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const QrCodeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
const UserGroupIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user, store, coupons, redemptions, onCreateCoupon, onDeleteCoupon, onValidateRedemption
}) => {
  const [view, setView] = useState<'overview' | 'manage' | 'validate'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  
  // Validation State
  const [validationCode, setValidationCode] = useState('');
  const [validationResult, setValidationResult] = useState<'idle' | 'success' | 'error' | 'expired'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form State
  const [newCoupon, setNewCoupon] = useState({
    title: '', description: '', discountValue: 0, quantity: 100, maxUsesPerUser: 1
  });

  // Derived Data
  const myCoupons = useMemo(() => coupons.filter(c => c.storeId === store.id), [coupons, store.id]);
  const myRedemptions = useMemo(() => redemptions.filter(r => myCoupons.find(c => c.id === r.couponId)), [redemptions, myCoupons]);
  
  // Stats
  const totalRedemptions = myRedemptions.length;
  const validatedRedemptions = myRedemptions.filter(r => r.status === 'USED').length;
  const activeCoupons = myCoupons.length;
  const uniqueUsersServed = new Set(myRedemptions.map(r => r.userId)).size;

  // Scanner Logic
  useEffect(() => {
    let scanner: any = null;
    let timer: any = null;

    if (isScannerOpen) {
      timer = setTimeout(() => {
        try {
          scanner = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true 
            },
            false
          );
          
          scanner.render(
            (decodedText: string) => {
              setValidationCode(decodedText);
              setIsScannerOpen(false); 
              // Auto trigger validation
              handleValidate(undefined, decodedText);
            },
            (error: any) => {
              // Ignore errors
            }
          );
        } catch (err) {
          console.error("Error initializing scanner:", err);
        }
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch((error: any) => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, [isScannerOpen]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCoupon({
      storeId: store.id,
      title: newCoupon.title,
      description: newCoupon.description,
      discountType: 'PERCENTAGE', 
      discountValue: newCoupon.discountValue,
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), 
      category: store.category,
      availableQuantity: newCoupon.quantity,
      maxUsesPerUser: newCoupon.maxUsesPerUser,
      rules: ['Regra padrão']
    });
    setIsModalOpen(false);
  };

  const handleValidate = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const codeToTest = codeOverride || validationCode;
    
    setIsValidating(true);
    setValidationResult('idle');

    // 1. Verify Crypto Signature
    const verification = await SecurityService.verifyToken(codeToTest);

    if (!verification.valid) {
      setIsValidating(false);
      setValidationResult(verification.reason === 'EXPIRED' ? 'expired' : 'error');
      setValidationMessage(verification.reason === 'EXPIRED' ? 'QR Code Expirado. Peça para o funcionário gerar um novo.' : 'QR Code Inválido ou Adulterado.');
      return;
    }

    // 2. If valid, check Redemption ID in "Database"
    // In our mock, we are looking for the redemption ID that matches the token's rid
    setTimeout(() => {
      // Logic adapter: we pass the rid (Redemption ID) to the app handler
      const success = onValidateRedemption(verification.data!.rid);
      
      if (success) {
        setValidationResult('success');
        setValidationMessage('Cupom validado com sucesso!');
      } else {
        setValidationResult('error');
        setValidationMessage('Cupom já utilizado ou não encontrado.');
      }
      setIsValidating(false);
    }, 600);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      onDeleteCoupon(couponToDelete.id);
      setCouponToDelete(null);
    }
  };

  const inputClasses = "input-base w-full px-3 py-3 rounded-xl transition-all focus:outline-none";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 glass-panel p-6 rounded-3xl shadow-lg">
         <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
            <img src={store.logoUrl} className="w-16 h-16 rounded-xl border border-border p-1 object-contain bg-white" alt="logo" />
            <div>
              <h1 className="text-2xl font-bold text-text-main leading-none">{store.name}</h1>
              <p className="text-text-muted text-sm mt-1">Painel do Gerente • {user.name}</p>
            </div>
         </div>
         {/* Navigation Tabs */}
         <div className="flex bg-surface/50 rounded-xl p-1 border border-border">
             {[
               { id: 'overview', label: 'Visão Geral', icon: <ChartIcon /> },
               { id: 'manage', label: 'Gerenciar Cupons', icon: <ListIcon /> },
               { id: 'validate', label: 'Validar', icon: <QrCodeIcon /> }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setView(tab.id as any)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === tab.id ? 'bg-primary-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
               >
                 {tab.icon}
                 <span className="hidden sm:inline">{tab.label}</span>
               </button>
             ))}
         </div>
      </div>

      {view === 'overview' && (
        <div className="animate-fade-in-up space-y-8">
           {/* Top Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl shadow-sm">
                 <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Cupons Ativos</p>
                 <p className="text-3xl font-extrabold text-text-main">{activeCoupons}</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl shadow-sm">
                 <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Gerados</p>
                 <p className="text-3xl font-extrabold text-primary-500">{totalRedemptions}</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl shadow-sm">
                 <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Validados (Usados)</p>
                 <p className="text-3xl font-extrabold text-green-500">{validatedRedemptions}</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl shadow-sm">
                 <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Funcionários Únicos</p>
                 <div className="flex items-center gap-2">
                    <UserGroupIcon />
                    <p className="text-3xl font-extrabold text-text-main">{uniqueUsersServed}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Card */}
              <div className="glass-panel p-6 rounded-2xl shadow-lg">
                 <h3 className="text-lg font-bold text-text-main mb-4">Performance dos Cupons</h3>
                 <div className="space-y-4">
                    {myCoupons.slice(0, 5).map(coupon => {
                       const usage = redemptions.filter(r => r.couponId === coupon.id).length;
                       const percentage = Math.min(100, Math.round((usage / coupon.availableQuantity) * 100));
                       return (
                         <div key={coupon.id}>
                            <div className="flex justify-between text-sm mb-1">
                               <span className="font-medium text-text-main">{coupon.title}</span>
                               <span className="text-text-muted">{usage} / {coupon.availableQuantity}</span>
                            </div>
                            <div className="w-full bg-surface rounded-full h-2.5">
                               <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                         </div>
                       );
                    })}
                    {myCoupons.length === 0 && <p className="text-text-muted text-sm">Nenhum cupom ativo para exibir dados.</p>}
                 </div>
              </div>

              {/* Recent Validations */}
              <div className="glass-panel p-6 rounded-2xl shadow-lg">
                 <h3 className="text-lg font-bold text-text-main mb-4">Últimas Validações</h3>
                 <div className="space-y-3">
                    {myRedemptions.filter(r => r.status === 'USED').slice(0, 5).sort((a,b) => new Date(b.validatedAt!).getTime() - new Date(a.validatedAt!).getTime()).map(redemption => (
                       <div key={redemption.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-xl border border-border">
                          <div className="truncate pr-4">
                             <p className="text-sm font-bold text-text-main truncate" title={redemption.code}>TOKEN: ...{redemption.code.substring(0, 8)}</p>
                             <p className="text-xs text-text-muted">
                                {new Date(redemption.validatedAt!).toLocaleDateString('pt-BR')} às {new Date(redemption.validatedAt!).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                          <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 whitespace-nowrap">Validado</span>
                       </div>
                    ))}
                    {myRedemptions.filter(r => r.status === 'USED').length === 0 && (
                      <div className="text-center py-8 text-text-muted text-sm border border-dashed border-border rounded-xl">
                        Nenhuma validação registrada ainda.
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {view === 'manage' && (
        <div className="animate-fade-in-up">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-main">Todos os Cupons</h2>
              <Button onClick={() => setIsModalOpen(true)}>+ Criar Cupom</Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCoupons.map(coupon => (
                 <div key={coupon.id} className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all group flex flex-col relative">
                    <button 
                      onClick={() => setCouponToDelete(coupon)}
                      className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors p-1"
                      title="Excluir Cupom"
                    >
                       <TrashIcon />
                    </button>

                    <h3 className="font-bold text-text-main mb-2 group-hover:text-primary-500 transition-colors line-clamp-1 pr-8">{coupon.title}</h3>
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">{coupon.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-border space-y-2">
                       <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Desconto</span>
                          <span className="text-primary-500 font-bold">{coupon.discountValue}% OFF</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Limite Usuário</span>
                          <span className="text-text-main">{coupon.maxUsesPerUser}x</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Total Estoque</span>
                          <span className="text-text-main">{coupon.availableQuantity}</span>
                       </div>
                    </div>
                 </div>
              ))}
              <div 
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-6 text-text-muted cursor-pointer hover:border-primary-500 hover:bg-primary-500/10 hover:text-primary-500 transition-all min-h-[200px]"
              >
                 <span className="text-4xl mb-2 font-light">+</span>
                 <span className="font-medium text-sm">Novo Cupom</span>
              </div>
           </div>
        </div>
      )}

      {view === 'validate' && (
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl shadow-2xl animate-pop-in">
           <h2 className="text-xl font-bold text-text-main mb-6 text-center">Validar Cupom</h2>
           
           <div className="mb-6 flex justify-center">
              <button 
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-primary-500/30 rounded-2xl bg-primary-500/5 hover:bg-primary-500/10 transition-colors group"
              >
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                   </svg>
                </div>
                <span className="text-primary-500 font-semibold">Escanear QR Code</span>
                <span className="text-xs text-text-muted mt-1">Utilizar câmera do dispositivo</span>
              </button>
           </div>

           <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase">Ou cole o token</span>
              <div className="flex-grow border-t border-border"></div>
           </div>

           <form onSubmit={(e) => handleValidate(e)}>
             <label className="block text-sm font-medium text-text-muted mb-2">Token Seguro</label>
             <input 
               type="text" 
               className="input-base block w-full px-4 py-3 text-sm font-mono rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-6"
               placeholder="Cole o token Base64..."
               value={validationCode}
               onChange={(e) => {
                 setValidationCode(e.target.value);
                 setValidationResult('idle');
               }}
             />
             <Button fullWidth type="submit" disabled={isValidating}>
                {isValidating ? <><Spinner /> Verificando...</> : 'Validar Agora'}
             </Button>
           </form>

           {validationResult !== 'idle' && (
             <div className={`mt-6 p-4 rounded-xl text-center border ${
                 validationResult === 'success' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 
                 validationResult === 'expired' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                 'bg-red-500/20 text-red-500 border-red-500/30'
               } animate-fade-in`}>
               {validationResult === 'success' ? (
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                       <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-bold">{validationMessage}</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-current opacity-20 rounded-full flex items-center justify-center mb-2">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="font-bold">{validationMessage}</p>
                 </div>
               )}
             </div>
           )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <div className="p-6 bg-main">
            <h2 className="text-xl font-bold mb-6 text-text-main">Novo Cupom</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm text-text-muted mb-1">Título</label>
                 <input required className={inputClasses} value={newCoupon.title} onChange={e => setNewCoupon({...newCoupon, title: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm text-text-muted mb-1">Descrição</label>
                 <textarea required className={inputClasses} value={newCoupon.description} onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Desconto (%)</label>
                    <input type="number" required className={inputClasses} value={newCoupon.discountValue} onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Qtd Total</label>
                    <input type="number" required className={inputClasses} value={newCoupon.quantity} onChange={e => setNewCoupon({...newCoupon, quantity: Number(e.target.value)})} />
                  </div>
               </div>
               <div>
                 <label className="block text-sm text-text-muted mb-1">Limite por Usuário</label>
                 <input type="number" min="1" required className={inputClasses} value={newCoupon.maxUsesPerUser} onChange={e => setNewCoupon({...newCoupon, maxUsesPerUser: Number(e.target.value)})} />
                 <p className="text-xs text-text-muted mt-1">Quantas vezes o mesmo funcionário pode resgatar este cupom.</p>
               </div>
               <Button fullWidth type="submit" className="mt-4">Publicar Cupom</Button>
            </form>
         </div>
      </Modal>

      {/* Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
         <div className="p-6 bg-main">
            <h2 className="text-xl font-bold text-text-main mb-4 text-center">Escanear Cupom</h2>
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner border border-border">
               <div id="reader" className="w-full"></div>
            </div>
            <p className="text-center text-sm text-text-muted mt-4">Aponte a câmera para o QR Code do funcionário.</p>
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => setIsScannerOpen(false)}>Cancelar</Button>
            </div>
         </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cupom"
        message={`Tem certeza que deseja excluir "${couponToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Cupom"
      />
    </div>
  );
};