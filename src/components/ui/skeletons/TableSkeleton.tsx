import { Skeleton, SkeletonWave } from "../skeleton"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "../table"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  hasActions?: boolean
  showHeader?: boolean
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  hasActions = true,
  showHeader = true 
}: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {hasActions && (
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === 0 ? (
                    <SkeletonWave className="h-4 w-32" />
                  ) : colIndex === 1 ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <Skeleton className="h-4 w-16" />
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
