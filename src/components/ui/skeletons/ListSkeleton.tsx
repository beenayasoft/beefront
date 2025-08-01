import { Skeleton, SkeletonWave } from "../skeleton"

interface ListSkeletonProps {
  items?: number
  hasAvatar?: boolean
  hasActions?: boolean
  variant?: 'simple' | 'detailed' | 'kanban'
}

export function ListSkeleton({ 
  items = 5, 
  hasAvatar = false, 
  hasActions = true,
  variant = 'simple'
}: ListSkeletonProps) {
  if (variant === 'kanban') {
    return <KanbanColumnSkeleton />
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          {hasAvatar && (
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonWave className="h-4 w-32" />
              {variant === 'detailed' && (
                <Skeleton className="h-6 w-16 rounded-full" />
              )}
            </div>
            {variant === 'detailed' && (
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          {hasActions && (
            <div className="flex space-x-2 flex-shrink-0">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function KanbanColumnSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <div key={columnIndex} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <SkeletonWave className="h-5 w-24" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <div key={cardIndex} className="p-4 bg-card border rounded-lg space-y-3">
                <SkeletonWave className="h-4 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
