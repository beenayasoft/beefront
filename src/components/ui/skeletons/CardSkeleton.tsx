import { Skeleton, SkeletonWave } from "../skeleton"
import { Card, CardContent, CardHeader } from "../card"

interface CardSkeletonProps {
  hasHeader?: boolean
  hasImage?: boolean
  hasActions?: boolean
  lines?: number
}

export function CardSkeleton({ 
  hasHeader = true, 
  hasImage = false, 
  hasActions = true,
  lines = 3 
}: CardSkeletonProps) {
  return (
    <Card>
      {hasHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonWave className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            {hasActions && (
              <Skeleton className="h-8 w-20 rounded" />
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {hasImage && (
          <SkeletonWave className="h-32 w-full rounded mb-4" />
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
            />
          ))}
        </div>
        {hasActions && (
          <div className="flex space-x-2 mt-4">
            <Skeleton className="h-9 w-20 rounded" />
            <Skeleton className="h-9 w-16 rounded" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <SkeletonWave className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
