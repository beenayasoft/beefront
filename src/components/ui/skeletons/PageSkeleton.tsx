import { Skeleton, SkeletonWave } from "../skeleton"
import { MetricCardSkeleton } from "./CardSkeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonWave className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <SkeletonWave className="h-6 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <SkeletonWave className="h-6 w-36" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between">
        <SkeletonWave className="h-8 w-40" />
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-32 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-28 rounded" />
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex space-x-4">
        <SkeletonWave className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
        <Skeleton className="h-10 w-28 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded" />
        ))}
      </div>

      {/* Content */}
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2">
        <SkeletonWave className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-t" />
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <div className="space-y-4">
          <SkeletonWave className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <SkeletonWave className="h-6 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
