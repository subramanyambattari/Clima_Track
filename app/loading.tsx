import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-14 w-2/3 bg-white/10" />
        <Skeleton className="h-64 w-full bg-white/10" />
      </div>
    </main>
  );
}
