import { NextResponse } from "next/server";
import { createUser } from "@/services/user-service";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const limiter = isProduction
    ? checkRateLimit(`signup:${getClientIdentifier(request)}`, 5, 15 * 60 * 1000)
    : { allowed: true, remaining: 999, resetAt: Date.now() };

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(limiter.remaining),
          "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  try {
    const body = await request.json();
    const user = await createUser(body);

    return NextResponse.json(
      { user },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": String(limiter.remaining)
        }
      }
    );
  } catch (error) {
    console.error("Signup request failed:", error);
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
