import React, { useState } from 'react';
import { Button } from './Button';

interface LoginScreenProps {
  onLogin: (identifier: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onLogin(identifier);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-up relative z-10">
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6 border border-white/20">
          <span className="text-3xl font-bold text-white drop-shadow-md">SP</span>
        </div>
        <h2 className="text-3xl font-extrabold text-text-main tracking-tight">
          ShopPerks
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Acesse sua conta para ver ou gerenciar cupons.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up relative z-10" style={{ animationDelay: '100ms' }}>
        <div className="glass-panel py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-text-main">
                E-mail ou CPF
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-base appearance-none block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  placeholder="email@loja.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-main">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base appearance-none block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button fullWidth type="submit" disabled={isLoading} className="justify-center">
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Entrar'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 glass-panel text-text-muted rounded">
                  Contas de Teste
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
               <button 
                 type="button"
                 onClick={() => { setIdentifier('ana@shopp.com'); setPassword('123'); }}
                 className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface/50 text-xs font-medium text-text-muted hover:bg-primary-500 hover:text-white transition-colors"
               >
                 Funcionário (ana@shopp.com)
               </button>
               <button 
                 type="button"
                 onClick={() => { setIdentifier('zara@shopp.com'); setPassword('123'); }}
                 className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface/50 text-xs font-medium text-text-muted hover:bg-primary-500 hover:text-white transition-colors"
               >
                 Gerente (zara@shopp.com)
               </button>
               <button 
                 type="button"
                 onClick={() => { setIdentifier('admin@shopp.com'); setPassword('123'); }}
                 className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-lg shadow-sm bg-surface/50 text-xs font-medium text-text-muted hover:bg-primary-500 hover:text-white transition-colors"
               >
                 Admin (admin@shopp.com)
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};