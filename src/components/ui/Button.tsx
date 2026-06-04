import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-black font-bold',
  secondary: 'bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/5',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold',
  ghost: 'text-white/40 hover:text-white font-medium',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-3 text-sm rounded-xl',
  lg: 'px-4 py-3.5 text-sm rounded-xl',
};

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 transition-all
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};