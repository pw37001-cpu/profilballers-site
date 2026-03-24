import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Get a single club by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const club = await db.club.findUnique({
      where: { id },
      include: {
        players: {
          where: { status: "published" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            photo: true,
          },
        },
        _count: {
          select: { players: true },
        },
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du club" },
      { status: 500 }
    );
  }
}

// PUT - Update a club
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const club = await db.club.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ club });
  } catch (error) {
    console.error("Error updating club:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du club" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a club
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if club has players
    const playersCount = await db.player.count({
      where: { currentClubId: id },
    });

    if (playersCount > 0) {
      return NextResponse.json(
        { error: "Ce club a des joueurs associés. Supprimez d'abord les joueurs ou changez leur club." },
        { status: 400 }
      );
    }

    await db.club.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting club:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du club" },
      { status: 500 }
    );
  }
}
