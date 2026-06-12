import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: CSSProperties;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hover = false,
  style = {},
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`${hover ? 'hover:border-green-500/20 transition-all cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: '#111111',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};