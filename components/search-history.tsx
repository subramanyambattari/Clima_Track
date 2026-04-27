import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTemperature } from "@/lib/utils";

type HistoryItem = {
  id: string;
  city: string;
  country?: string | null;
  unit: string;
  temperature: number;
  condition: string;
  outfitTitle: string;
  queryType: string;
  createdAt: string;
};

export function SearchHistory({ items }: { items: HistoryItem[] }) {
  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <CardDescription className="text-cyan-200/80">Search history</CardDescription>
        <CardTitle className="font-[var(--font-display)] text-3xl">Recent weather lookups</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Your previous city searches will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {item.city}
                      {item.country ? `, ${item.country}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{item.outfitTitle}</p>
                  </div>
                  <Badge variant="outline">
                    {formatTemperature(item.temperature, item.unit === "imperial" ? "imperial" : "metric")}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>{item.condition}</span>
                  <span>|</span>
                  <span>{item.queryType}</span>
                  <span>|</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
