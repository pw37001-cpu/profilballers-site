import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Get a single player by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await db.player.findUnique({
      where: { id },
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
    });

    if (!player) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du joueur" },
      { status: 500 }
    );
  }
}

// PUT - Update a player (full update including history and statistics)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
      history,
      statistics,
    } = body;

    // Update player basic info
    const player = await db.player.update({
      where: { id },
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
        status,
        updatedAt: new Date(),
      },
      include: {
        currentClub: true,
        history: { include: { club: true }, orderBy: { season: "desc" } },
        statistics: { orderBy: { season: "desc" } },
      },
    });

    // Update history if provided
    if (history && Array.isArray(history)) {
      // Delete existing history
      await db.playerHistory.deleteMany({ where: { playerId: id } });
      
      // Create new history entries
      if (history.length > 0) {
        await db.playerHistory.createMany({
          data: history.map((h: any) => ({
            playerId: id,
            season: h.season,
            clubId: h.clubId,
          })),
        });
      }
    }

    // Update statistics if provided
    if (statistics && Array.isArray(statistics)) {
      // Delete existing statistics
      await db.statistic.deleteMany({ where: { playerId: id } });
      
      // Create new statistics entries
      if (statistics.length > 0) {
        await db.statistic.createMany({
          data: statistics.map((s: any) => ({
            playerId: id,
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
            totalPts: s.totalPts || 0,
            totalReb: s.totalReb || 0,
            totalAst: s.totalAst || 0,
            totalBlk: s.totalBlk || 0,
            totalStl: s.totalStl || 0,
            totalMin: s.totalMin || 0,
            fgMade: s.fgMade || 0,
            fgAtt: s.fgAtt || 0,
            threeMade: s.threeMade || 0,
            threeAtt: s.threeAtt || 0,
            ftMade: s.ftMade || 0,
            ftAtt: s.ftAtt || 0,
          })),
        });
      }
    }

    // Fetch updated player with all relations
    const updatedPlayer = await db.player.findUnique({
      where: { id },
      include: {
        currentClub: true,
        history: { include: { club: true }, orderBy: { season: "desc" } },
        statistics: { orderBy: { season: "desc" } },
      },
    });

    return NextResponse.json({ player: updatedPlayer });
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du joueur" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a player
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.player.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du joueur" },
      { status: 500 }
    );
  }
}

// PATCH - Update player status (for moderation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["pending", "published", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const player = await db.player.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ player });
  } catch (error) {
    console.error("Error updating player status:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}
