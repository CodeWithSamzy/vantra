import Skeleton from "@/components/Skeleton";

export default function PageSkeleton({
  rows = 4,
  width = "max-w-3xl",
  showStats = false,
}: {
  rows?: number;
  width?: string;
  showStats?: boolean;
}) {
  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className={`mx-auto ${width}`} role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-72" />

        {showStats && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-line bg-white p-4"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-3 h-7 w-12" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg border border-line bg-white">
          <div className="border-b border-line p-4">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4 p-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}