import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-4 lg:block">
          <Skeleton className="h-10 w-40 bg-white/10" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full bg-white/10" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-80 w-full bg-white/10" />
            <Skeleton className="h-80 w-full bg-white/10" />
          </div>
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    </main>
  );
}
