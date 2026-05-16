import { clsx } from 'clsx'

export function SkeletonLoader({ className = '', lines = 3, showAvatar = false }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer-bg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 shimmer-bg rounded-lg w-3/4" />
            <div className="h-2.5 shimmer-bg rounded-lg w-1/2" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 shimmer-bg rounded-lg"
          style={{ width: `${Math.floor(Math.random() * 30 + 60)}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={clsx('glass rounded-2xl p-5 space-y-4', className)}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl shimmer-bg" />
        <div className="h-6 w-16 shimmer-bg rounded-full" />
      </div>
      <div className="h-7 shimmer-bg rounded-lg w-1/2" />
      <div className="h-3 shimmer-bg rounded-lg w-3/4" />
    </div>
  )
}

export function SkeletonText({ width = '100%', height = 12, className = '' }) {
  return (
    <div
      className={clsx('shimmer-bg rounded-lg', className)}
      style={{ width, height }}
    />
  )
}

export default SkeletonLoader