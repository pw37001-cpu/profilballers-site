import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Search players and clubs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ players: [], clubs: [] });
    }

    // Search players
    const players = await db.player.findMany({
      where: {
        status: "published",
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
        ],
      },
      include: {
        currentClub: true,
      },
      take: 10,
    });

    // Search clubs
    const clubs = await db.club.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { city: { contains: query } },
        ],
      },
      include: {
        _count: {
          select: { players: true },
        },
      },
      take: 10,
    });

    return NextResponse.json({ players, clubs });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
