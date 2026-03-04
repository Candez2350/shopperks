import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none tracking-wide text-sm";
  
  const variants = {
    // Primary: Uses the theme's primary color variable
    primary: "bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:shadow-primary-500/40",
    
    // Secondary: Surface based with border
    secondary: "bg-surface text-text-main border border-border hover:bg-surface/80 hover:border-gray-500",
    
    // Outline: Primary border and text
    outline: "border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10",
    
    // Ghost: Subtle
    ghost: "text-text-muted hover:text-text-main hover:bg-surface/50",
    
    // Danger: Red
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};