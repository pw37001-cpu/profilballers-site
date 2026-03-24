import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Get a single match with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await db.match.findUnique({
      where: { id },
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
          orderBy: {
            player: {
              lastName: "asc",
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du match" },
      { status: 500 }
    );
  }
}

// PATCH - Update a match
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const match = await db.match.update({
      where: { id },
      data: {
        ...(body.date && { date: new Date(body.date) }),
        ...(body.season && { season: body.season }),
        ...(body.homeScore !== undefined && { homeScore: body.homeScore }),
        ...(body.awayScore !== undefined && { awayScore: body.awayScore }),
        ...(body.status && { status: body.status }),
        ...(body.venue !== undefined && { venue: body.venue }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        homeClub: true,
        awayClub: true,
      },
    });

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du match" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First delete all player stats for this match
    await db.playerMatchStats.deleteMany({
      where: { matchId: id },
    });

    // Then delete the match
    await db.match.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du match" },
      { status: 500 }
    );
  }
}
