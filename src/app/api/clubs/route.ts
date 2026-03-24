import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - List all clubs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || "";

    const where: any = {};
    if (level) {
      where.level = level;
    }

    const clubs = await db.club.findMany({
      where,
      include: {
        _count: {
          select: { players: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clubs" },
      { status: 500 }
    );
  }
}

// POST - Create a new club
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, level, logo } = body;

    // Check for duplicate
    const existingClub = await db.club.findFirst({
      where: {
        name: { equals: name },
        city: { equals: city },
      },
    });

    if (existingClub) {
      return NextResponse.json(
        { error: "Un club avec ce nom existe déjà dans cette ville" },
        { status: 400 }
      );
    }

    const club = await db.club.create({
      data: {
        name,
        city,
        level,
        logo,
      },
    });

    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du club" },
      { status: 500 }
    );
  }
}
