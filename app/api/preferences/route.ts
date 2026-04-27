import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPreferences, upsertPreferences } from "@/services/user-service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getPreferences(session.user.id);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const preferences = await upsertPreferences(session.user.id, body);
    return NextResponse.json({ preferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update preferences.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
