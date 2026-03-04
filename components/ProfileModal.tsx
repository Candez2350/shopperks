import React, { useState } from 'react';
import { User, Badge } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedData: Partial<User> & { password?: string }) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'badges'>('info');
  const [formData, setFormData] = useState({
    name: user.name,
    avatarUrl: user.avatarUrl || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onUpdateUser({
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        ...(formData.password ? { password: formData.password } : {})
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  const inputClasses = "input-base w-full p-3 rounded-xl transition-all focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-main flex flex-col h-full max-h-[90vh]">
        {/* Header Tabs */}
        <div className="flex border-b border-border">
           <button 
             onClick={() => setActiveTab('info')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-text-muted hover:text-text-main'}`}
           >
             Dados Pessoais
           </button>
           <button 
             onClick={() => setActiveTab('badges')}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'badges' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-text-muted hover:text-text-main'}`}
           >
             Conquistas {user.badges && user.badges.length > 0 && `(${user.badges.length})`}
           </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'info' ? (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div className="flex justify-center mb-6">
                 <div className="relative">
                   <img 
                     src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.name}`} 
                     className="w-24 h-24 rounded-full border-4 border-surface shadow-md object-cover" 
                     alt="Avatar"
                   />
                   <div className="absolute bottom-0 right-0 bg-primary-500 p-1.5 rounded-full text-white shadow-sm border-2 border-main">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </div>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nome Completo</label>
                <input 
                  required 
                  className={inputClasses} 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">URL do Avatar</label>
                <input 
                  className={inputClasses} 
                  value={formData.avatarUrl} 
                  onChange={e => setFormData({...formData, avatarUrl: e.target.value})} 
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h3 className="text-sm font-bold text-text-main mb-3">Alterar Senha</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Nova Senha</label>
                    <input 
                      type="password"
                      className={inputClasses} 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="Deixe em branco para manter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Confirmar Nova Senha</label>
                    <input 
                      type="password"
                      className={inputClasses} 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    />
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-6">
               <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-text-main">Sua Coleção</h3>
                 <p className="text-sm text-text-muted">Desbloqueie medalhas ao usar o app.</p>
               </div>
               
               {(!user.badges || user.badges.length === 0) ? (
                 <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <span className="text-4xl grayscale opacity-30">🏆</span>
                    <p className="text-text-muted mt-2">Nenhuma conquista ainda.</p>
                    <p className="text-xs text-text-muted">Resgate seu primeiro cupom para começar!</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                    {user.badges.map((badge) => (
                      <div key={badge.id} className="glass-panel p-4 rounded-xl flex flex-col items-center text-center border-primary-500/30 bg-gradient-to-br from-surface to-primary-900/10">
                         <div className="text-4xl mb-2 filter drop-shadow-md animate-blob">{badge.icon}</div>
                         <h4 className="font-bold text-text-main text-sm">{badge.name}</h4>
                         <p className="text-xs text-text-muted mt-1 leading-tight">{badge.description}</p>
                         <span className="text-[10px] text-primary-500 mt-2 opacity-70">
                            {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                         </span>
                      </div>
                    ))}
                 </div>
               )}
               
               <div className="bg-surface/50 p-4 rounded-xl border border-border mt-4">
                  <h4 className="text-xs font-bold uppercase text-text-muted mb-2">Próximos Desafios</h4>
                  <ul className="space-y-2 text-sm">
                     <li className="flex items-center gap-2 opacity-60">
                        <span className="w-5 h-5 bg-border rounded-full flex items-center justify-center text-[10px]">🔒</span>
                        <span>Explorador de Ofertas (5 resgates)</span>
                     </li>
                     <li className="flex items-center gap-2 opacity-60">
                        <span className="w-5 h-5 bg-border rounded-full flex items-center justify-center text-[10px]">🔒</span>
                        <span>Cliente VIP (10 resgates)</span>
                     </li>
                  </ul>
               </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};