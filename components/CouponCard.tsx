
import React, { useRef, useState } from 'react';
import { Coupon, Store } from '../types';
import { Button } from './Button';

interface CouponCardProps {
  coupon: Coupon;
  store: Store;
  onClick: () => void;
  isRedeemed?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, store, onClick, isRedeemed = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Holographic/3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isRedeemed) return;
    
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotate({ x: 0, y: 0 });
  };

  // Determine gradient based on category
  const getGradient = (cat: string) => {
    switch(cat) {
      case 'Alimentação': return 'from-orange-500/20 to-red-500/20';
      case 'Moda': return 'from-purple-500/20 to-pink-500/20';
      case 'Esportes': return 'from-blue-500/20 to-cyan-500/20';
      default: return 'from-gray-500/20 to-slate-500/20';
    }
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={(e) => { setIsHovering(true); handleMouseMove(e); }}
      onMouseLeave={handleMouseLeave}
      className={`group relative h-full transition-all duration-300 ${isRedeemed ? 'grayscale-[0.5] opacity-80' : 'cursor-pointer'}`}
      style={{
        transform: isHovering && !isRedeemed ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.02)` : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
        transition: isHovering ? 'none' : 'all 0.5s ease'
      }}
      onClick={onClick}
    >
      <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col h-full shadow-lg ${isRedeemed ? '' : 'hover:shadow-primary-500/20 hover:border-primary-500/40'}`}>
        
        {/* Flash Deal Label (AI Feature) */}
        {coupon.isFlashDeal && !isRedeemed && (
          <div className="absolute top-0 left-0 w-full z-20 overflow-hidden">
             <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-bold px-3 py-1 text-center animate-pulse tracking-widest uppercase">
                ⚡ Flash Deal • Preço Dinâmico
             </div>
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 right-3 z-10 mt-6">
          <div className={`px-3 py-1 rounded-full shadow-sm border backdrop-blur-md ${isRedeemed ? 'bg-green-100/90 border-green-200' : 'bg-surface/90 border-border'}`}>
            <span className={`font-bold text-sm ${isRedeemed ? 'text-green-600' : 'text-primary-500'}`}>
              {coupon.discountType === 'PERCENTAGE' 
                ? `${coupon.discountValue}% OFF` 
                : `R$ ${coupon.discountValue} OFF`}
            </span>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative h-40 overflow-hidden bg-surface">
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(store.category)} opacity-60 z-0`} />
          <img 
            src={store.coverUrl} 
            alt={store.name} 
            className={`w-full h-full object-cover transform transition-transform duration-700 opacity-90 ${isRedeemed ? '' : 'group-hover:scale-110'}`}
          />
          
          {/* Holographic Shine Overlay */}
          {!isRedeemed && isHovering && (
             <div 
               className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-10"
               style={{ transform: `translateX(${-rotate.y * 5}%) translateY(${-rotate.x * 5}%)` }}
             />
          )}

          {/* Logo overlay */}
          <div className="absolute -bottom-6 left-4 glass-panel p-1 rounded-xl shadow-md w-16 h-16 flex items-center justify-center z-10">
             <div className="w-full h-full rounded-lg overflow-hidden bg-white flex items-center justify-center">
               {store.logoUrl.includes('http') ? (
                  <img src={store.logoUrl} alt="logo" className="w-full h-full object-contain" />
               ) : (
                  <span className="text-xs font-bold text-gray-900">{store.name.substring(0,2)}</span>
               )}
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 pt-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {store.category} • {store.floor}
            </span>
            {coupon.trendingScore && coupon.trendingScore > 80 && !isRedeemed && (
               <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                 Em Alta
               </span>
            )}
          </div>

          <h3 className={`text-lg font-bold leading-tight mb-2 line-clamp-2 transition-colors ${isRedeemed ? 'text-text-muted' : 'text-text-main group-hover:text-primary-500'}`}>
            {coupon.title}
          </h3>
          
          <p className="text-text-muted text-sm mb-4 line-clamp-2 flex-1 font-medium">
            {coupon.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <div className="text-xs text-text-muted">
              Válido até <br/>
              <span className="text-text-main font-semibold">
                {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {isRedeemed ? (
              <div className="py-2 px-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Resgatado
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="!py-2 !px-4 !text-xs !rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Ver Cupom
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
