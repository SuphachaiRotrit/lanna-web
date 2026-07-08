import React from 'react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  leftIcon, 
  rightIcon, 
  children, 
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy/90 shadow-xl shadow-navy/20 active:scale-[0.98]',
    brand: 'bg-brand text-navy hover:bg-brand/90 shadow-xl shadow-brand/20 active:scale-[0.98] font-black',
    secondary: 'bg-gray-100 text-navy hover:bg-gray-200 active:scale-[0.98]',
    outline: 'bg-transparent border-2 border-gray-100 text-navy hover:border-brand/30 hover:bg-brand/5 active:scale-[0.98]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-200 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm',
    xl: 'px-12 py-4 text-base font-black tracking-widest',
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export const PremiumCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-[2rem] border-2 border-gray-50/50 shadow-sm hover:shadow-xl hover:shadow-navy/5 transition-all duration-500 ${className}`}>
    {children}
  </div>
);
