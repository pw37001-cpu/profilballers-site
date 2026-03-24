import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Player } from "@prisma/client";

// GET - List all players with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const position = searchParams.get("position") || "";
    const level = searchParams.get("level") || "";
    const gender = searchParams.get("gender") || "";
    const clubId = searchParams.get("clubId") || "";
    const status = searchParams.get("status") || "published";
    const city = searchParams.get("city") || "";

    const where: any = {};

    // Status filter (default to published for public view)
    if (status !== "all") {
      where.status = status;
    }

    // Search by name
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    // Position filter
    if (position) {
      where.position = position;
    }

    // Gender filter
    if (gender) {
      where.gender = gender;
    }

    // Level filter (through club)
    if (level || clubId) {
      where.currentClub = {};
      if (level) {
        where.currentClub.level = level;
      }
      if (clubId) {
        where.currentClubId = clubId;
      }
    }

    // City filter
    if (city) {
      where.city = { contains: city };
    }

    const players = await db.player.findMany({
      where,
      include: {
        currentClub: true,
        history: {
          include: {
            club: true,
          },
          orderBy: {
            season: "desc",
          },
        },
        statistics: {
          orderBy: {
            season: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des joueurs" },
      { status: 500 }
    );
  }
}

// POST - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lastName,
      firstName,
      gender,
      birthYear,
      height,
      weight,
      position,
      strongHand,
      photo,
      city,
      country,
      // Contact information
      email,
      phone,
      // Social media links
      youtubeLink,
      instagramLink,
      twitterLink,
      facebookLink,
      tiktokLink,
      currentClubId,
      history,
      statistics,
    } = body;

    // Check for duplicates
    const existingPlayer = await db.player.findFirst({
      where: {
        lastName: { equals: lastName },
        firstName: { equals: firstName },
        birthYear,
      },
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Un joueur avec ce nom et cette année de naissance existe déjà", duplicateId: existingPlayer.id },
        { status: 400 }
      );
    }

    // Create player with related data
    const player = await db.player.create({
      data: {
        lastName,
        firstName,
        gender,
        birthYear,
        height,
        weight,
        position,
        strongHand,
        photo,
        city,
        country: country || "Côte d'Ivoire",
        // Contact information
        email,
        phone,
        // Social media links
        youtubeLink,
        instagramLink,
        twitterLink,
        facebookLink,
        tiktokLink,
        currentClubId,
        status: "pending",
        history: history
          ? {
              create: history.map((h: any) => ({
                season: h.season,
                clubId: h.clubId,
              })),
            }
          : undefined,
        statistics: statistics
          ? {
              create: statistics.map((s: any) => ({
                season: s.season,
                games: s.games || 0,
                pts: s.pts || 0,
                reb: s.reb || 0,
                ast: s.ast || 0,
                blk: s.blk || 0,
                stl: s.stl || 0,
                fgPercent: s.fgPercent,
                threePt: s.threePt,
                ftPercent: s.ftPercent,
                min: s.min || 0,
              })),
            }
          : undefined,
      },
      include: {
        currentClub: true,
        history: {
          include: { club: true },
        },
        statistics: true,
      },
    });

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du joueur" },
      { status: 500 }
    );
  }
}
