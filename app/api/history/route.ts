import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSearchHistory, recordSearchHistory } from "@/services/user-service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await listSearchHistory(session.user.id);
  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const history = await recordSearchHistory({
      userId: session.user.id,
      city: body.city,
      country: body.country,
      unit: body.unit,
      temperature: body.temperature,
      condition: body.condition,
      outfitTitle: body.outfitTitle,
      queryType: body.queryType
    });
    return NextResponse.json({ history }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record search.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
