interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/5 rounded-2xl ${className}`}
        />
      ))}
    </>
  );
};