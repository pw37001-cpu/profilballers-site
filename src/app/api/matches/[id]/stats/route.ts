import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recalculateSeasonStats, calculateEfficiency } from "@/lib/stats-calculator";

// GET - Get all player stats for a match
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    const stats = await db.playerMatchStats.findMany({
      where: { matchId },
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
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching match stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

// POST - Add or update player stats for a match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const body = await request.json();

    // Check if match exists
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Validate required fields
    const { playerId, ...stats } = body;
    if (!playerId) {
      return NextResponse.json(
        { error: "ID joueur requis" },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await db.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      );
    }

    // Calculate efficiency
    const efficiency = calculateEfficiency({
      pts: stats.pts || 0,
      reb: stats.reb || 0,
      ast: stats.ast || 0,
      stl: stats.stl || 0,
      blk: stats.blk || 0,
      fgAtt: stats.fgAtt || 0,
      fgMade: stats.fgMade || 0,
      ftAtt: stats.ftAtt || 0,
      ftMade: stats.ftMade || 0,
      to: stats.to || 0,
    });

    // Upsert player stats
    const playerStats = await db.playerMatchStats.upsert({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
      create: {
        matchId,
        playerId,
        min: stats.min || 0,
        pts: stats.pts || 0,
        reb: stats.reb || 0,
        ast: stats.ast || 0,
        blk: stats.blk || 0,
        stl: stats.stl || 0,
        to: stats.to || 0,
        pf: stats.pf || 0,
        fgMade: stats.fgMade || 0,
        fgAtt: stats.fgAtt || 0,
        threeMade: stats.threeMade || 0,
        threeAtt: stats.threeAtt || 0,
        ftMade: stats.ftMade || 0,
        ftAtt: stats.ftAtt || 0,
        plusMinus: stats.plusMinus || 0,
        eff: efficiency,
      },
      update: {
        min: stats.min || 0,
        pts: stats.pts || 0,
        reb: stats.reb || 0,
        ast: stats.ast || 0,
        blk: stats.blk || 0,
        stl: stats.stl || 0,
        to: stats.to || 0,
        pf: stats.pf || 0,
        fgMade: stats.fgMade || 0,
        fgAtt: stats.fgAtt || 0,
        threeMade: stats.threeMade || 0,
        threeAtt: stats.threeAtt || 0,
        ftMade: stats.ftMade || 0,
        ftAtt: stats.ftAtt || 0,
        plusMinus: stats.plusMinus || 0,
        eff: efficiency,
      },
    });

    // Recalculate season stats for this player
    await recalculateSeasonStats(playerId, match.season);

    return NextResponse.json({ stats: playerStats });
  } catch (error) {
    console.error("Error saving match stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des statistiques" },
      { status: 500 }
    );
  }
}

// DELETE - Delete player stats from a match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "ID joueur requis" },
        { status: 400 }
      );
    }

    // Get match to know the season
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Delete the stats
    await db.playerMatchStats.delete({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
    });

    // Recalculate season stats
    await recalculateSeasonStats(playerId, match.season);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des statistiques" },
      { status: 500 }
    );
  }
}
