import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recalculateSeasonStats, calculateEfficiency } from "@/lib/stats-calculator";

// POST - Batch update player stats for a match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    const body = await request.json();
    const { players } = body;

    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { error: "Liste de joueurs requise" },
        { status: 400 }
      );
    }

    // Check if match exists
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    const results = [];
    const playersToUpdate = new Set<string>();

    for (const playerData of players) {
      const { playerId, ...stats } = playerData;

      if (!playerId) continue;

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
        turnovers: stats.turnovers || 0,
      });

      try {
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
            turnovers: stats.turnovers || 0,
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
            turnovers: stats.turnovers || 0,
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

        results.push(playerStats);
        playersToUpdate.add(playerId);
      } catch (err) {
        console.error(`Error updating stats for player ${playerId}:`, err);
      }
    }

    // Recalculate season stats for all affected players
    for (const playerId of playersToUpdate) {
      await recalculateSeasonStats(playerId, match.season);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      stats: results,
    });
  } catch (error) {
    console.error("Error batch updating match stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des statistiques" },
      { status: 500 }
    );
  }
}
