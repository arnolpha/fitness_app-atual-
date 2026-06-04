import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-white/20">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-semibold">{title}</p>
      {description && (
        <p className="text-xs mt-1 text-white/20">{description}</p>
      )}
    </div>
  );
};