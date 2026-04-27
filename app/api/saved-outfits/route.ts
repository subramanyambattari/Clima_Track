import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deleteSavedOutfit,
  listSavedOutfits,
  saveOutfit
} from "@/services/user-service";
import { createOutfitSuggestion } from "@/services/outfit-service";
import type { OutfitSuggestion } from "@/types/outfit";
import type { WeatherData } from "@/types/weather";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outfits = await listSavedOutfits(session.user.id);
  return NextResponse.json({ outfits });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      weather: WeatherData;
      suggestion?: OutfitSuggestion;
    };

    const suggestion =
      body.suggestion ?? createOutfitSuggestion(body.weather, "casual");

    const outfit = await saveOutfit(session.user.id, suggestion, body.weather);
    return NextResponse.json({ outfit }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save outfit.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing outfit id." }, { status: 400 });
  }

  await deleteSavedOutfit(session.user.id, id);
  return NextResponse.json({ ok: true });
}
