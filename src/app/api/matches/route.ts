import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - List all matches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const clubId = searchParams.get("clubId");
    const status = searchParams.get("status");

    const where: any = {};
    if (season) where.season = season;
    if (status) where.status = status;
    if (clubId) {
      where.OR = [{ homeClubId: clubId }, { awayClubId: clubId }];
    }

    const matches = await db.match.findMany({
      where,
      include: {
        homeClub: true,
        awayClub: true,
        playerStats: {
          include: {
            player: {
              include: {
                currentClub: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des matchs" },
      { status: 500 }
    );
  }
}

// POST - Create a new match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      season,
      homeClubId,
      awayClubId,
      homeScore,
      awayScore,
      venue,
      notes,
    } = body;

    // Validate required fields
    if (!date || !season || !homeClubId || !awayClubId) {
      return NextResponse.json(
        { error: "Date, saison et clubs sont requis" },
        { status: 400 }
      );
    }

    if (homeClubId === awayClubId) {
      return NextResponse.json(
        { error: "Les deux clubs doivent être différents" },
        { status: 400 }
      );
    }

    const match = await db.match.create({
      data: {
        date: new Date(date),
        season,
        homeClubId,
        awayClubId,
        homeScore: homeScore || 0,
        awayScore: awayScore || 0,
        venue,
        notes,
      },
      include: {
        homeClub: true,
        awayClub: true,
      },
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du match" },
      { status: 500 }
    );
  }
}
