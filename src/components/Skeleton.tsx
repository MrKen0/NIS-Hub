interface SkeletonProps {
  count?: number;
  className?: string;
}

export default function Skeleton({ count = 4, className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-4 w-3/4 rounded bg-slate-200"></div>
          <div className="mt-3 h-3 w-1/2 rounded bg-slate-200"></div>
          <div className="mt-2 h-8 w-full rounded bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}
