export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="glass rounded-2xl border border-ix-border overflow-hidden">
      {/* Header */}
      <div className="grid gap-4 px-5 py-3 border-b border-ix-border"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 shimmer-bg rounded w-3/4" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-5 py-4 border-b border-ix-border/50 last:border-0 items-center"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j}>
              {j === 0 ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl shimmer-bg flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 shimmer-bg rounded w-3/4" />
                    <div className="h-2 shimmer-bg rounded w-1/2" />
                  </div>
                </div>
              ) : (
                <div className="h-3 shimmer-bg rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}