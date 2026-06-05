import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#111111] border border-white/5 rounded-2xl p-5
        ${hover ? 'hover:border-green-500/20 transition-all cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};