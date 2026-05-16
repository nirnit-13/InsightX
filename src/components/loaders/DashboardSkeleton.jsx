import { SkeletonCard, SkeletonText } from './SkeletonLoader'

export default function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 shimmer-bg rounded-xl w-64" />
          <div className="h-4 shimmer-bg rounded-lg w-40" />
        </div>
        <div className="h-10 shimmer-bg rounded-xl w-40" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Progress bars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 shimmer-bg rounded w-24" />
              <div className="h-3 shimmer-bg rounded w-12" />
            </div>
            <div className="h-1.5 shimmer-bg rounded-full w-full" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
          <div className="h-5 shimmer-bg rounded w-40" />
          <div className="h-52 shimmer-bg rounded-xl w-full" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="h-5 shimmer-bg rounded w-32" />
          <div className="h-40 shimmer-bg rounded-xl w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 shimmer-bg rounded w-20" />
              <div className="h-3 shimmer-bg rounded w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-4">
            <div className="h-5 shimmer-bg rounded w-36" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl shimmer-bg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 shimmer-bg rounded w-3/4" />
                  <div className="h-2.5 shimmer-bg rounded w-1/2" />
                </div>
                <div className="h-5 w-12 shimmer-bg rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}