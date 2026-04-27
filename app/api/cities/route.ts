import { NextResponse } from "next/server";
import { citySearchSchema } from "@/lib/validators";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { searchCities } from "@/services/weather-service";

export async function GET(request: Request) {
  const limiter = checkRateLimit(
    `cities:${getClientIdentifier(request)}`,
    20,
    60 * 1000
  );

  if (!limiter.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = citySearchSchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter at least 2 characters." }, { status: 400 });
  }

  try {
    const cities = await searchCities(parsed.data.q);
    return NextResponse.json(
      { cities },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to search cities.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
