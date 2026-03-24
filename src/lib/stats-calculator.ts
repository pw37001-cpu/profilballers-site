import { db } from "./db";

/**
 * Calculate player efficiency rating
 * Formula: (PTS + REB + AST + STL + BLK - ((FGA - FGM) + (FTA - FTM) + TO))
 */
export function calculateEfficiency(stats: {
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgAtt: number;
  fgMade: number;
  ftAtt: number;
  ftMade: number;
  to: number;
}): number {
  const missedFG = stats.fgAtt - stats.fgMade;
  const missedFT = stats.ftAtt - stats.ftMade;
  const efficiency =
    stats.pts +
    stats.reb +
    stats.ast +
    stats.stl +
    stats.blk -
    (missedFG + missedFT + stats.to);
  return Math.round(efficiency * 100) / 100;
}

/**
 * Calculate field goal percentage
 */
export function calculateFGPercent(made: number, attempted: number): number | null {
  if (attempted === 0) return null;
  return Math.round((made / attempted) * 1000) / 10;
}

/**
 * Recalculate season statistics for a player
 * This aggregates all match stats for the season and updates the Statistic record
 */
export async function recalculateSeasonStats(playerId: string, season: string) {
  // Get all match stats for this player in this season
  const matchStats = await db.playerMatchStats.findMany({
    where: {
      playerId,
      match: {
        season,
      },
    },
    include: {
      match: true,
    },
  });

  if (matchStats.length === 0) {
    // No stats for this season, create or reset
    await db.statistic.upsert({
      where: {
        playerId_season: {
          playerId,
          season,
        },
      },
      create: {
        playerId,
        season,
        games: 0,
        pts: 0,
        reb: 0,
        ast: 0,
        blk: 0,
        stl: 0,
        min: 0,
        totalPts: 0,
        totalReb: 0,
        totalAst: 0,
        totalBlk: 0,
        totalStl: 0,
        totalMin: 0,
        fgMade: 0,
        fgAtt: 0,
        threeMade: 0,
        threeAtt: 0,
        ftMade: 0,
        ftAtt: 0,
        fgPercent: null,
        threePt: null,
        ftPercent: null,
      },
      update: {
        games: 0,
        pts: 0,
        reb: 0,
        ast: 0,
        blk: 0,
        stl: 0,
        min: 0,
        totalPts: 0,
        totalReb: 0,
        totalAst: 0,
        totalBlk: 0,
        totalStl: 0,
        totalMin: 0,
        fgMade: 0,
        fgAtt: 0,
        threeMade: 0,
        threeAtt: 0,
        ftMade: 0,
        ftAtt: 0,
        fgPercent: null,
        threePt: null,
        ftPercent: null,
      },
    });
    return;
  }

  // Aggregate totals
  const totals = matchStats.reduce(
    (acc, stat) => ({
      games: acc.games + 1,
      totalPts: acc.totalPts + stat.pts,
      totalReb: acc.totalReb + stat.reb,
      totalAst: acc.totalAst + stat.ast,
      totalBlk: acc.totalBlk + stat.blk,
      totalStl: acc.totalStl + stat.stl,
      totalMin: acc.totalMin + stat.min,
      fgMade: acc.fgMade + stat.fgMade,
      fgAtt: acc.fgAtt + stat.fgAtt,
      threeMade: acc.threeMade + stat.threeMade,
      threeAtt: acc.threeAtt + stat.threeAtt,
      ftMade: acc.ftMade + stat.ftMade,
      ftAtt: acc.ftAtt + stat.ftAtt,
    }),
    {
      games: 0,
      totalPts: 0,
      totalReb: 0,
      totalAst: 0,
      totalBlk: 0,
      totalStl: 0,
      totalMin: 0,
      fgMade: 0,
      fgAtt: 0,
      threeMade: 0,
      threeAtt: 0,
      ftMade: 0,
      ftAtt: 0,
    }
  );

  const games = totals.games;

  // Calculate averages
  const averages = {
    pts: Math.round((totals.totalPts / games) * 10) / 10,
    reb: Math.round((totals.totalReb / games) * 10) / 10,
    ast: Math.round((totals.totalAst / games) * 10) / 10,
    blk: Math.round((totals.totalBlk / games) * 10) / 10,
    stl: Math.round((totals.totalStl / games) * 10) / 10,
    min: Math.round((totals.totalMin / games) * 10) / 10,
  };

  // Calculate percentages
  const fgPercent = calculateFGPercent(totals.fgMade, totals.fgAtt);
  const threePt = calculateFGPercent(totals.threeMade, totals.threeAtt);
  const ftPercent = calculateFGPercent(totals.ftMade, totals.ftAtt);

  // Upsert the statistic record
  await db.statistic.upsert({
    where: {
      playerId_season: {
        playerId,
        season,
      },
    },
    create: {
      playerId,
      season,
      games,
      ...averages,
      totalPts: totals.totalPts,
      totalReb: totals.totalReb,
      totalAst: totals.totalAst,
      totalBlk: totals.totalBlk,
      totalStl: totals.totalStl,
      totalMin: totals.totalMin,
      fgMade: totals.fgMade,
      fgAtt: totals.fgAtt,
      threeMade: totals.threeMade,
      threeAtt: totals.threeAtt,
      ftMade: totals.ftMade,
      ftAtt: totals.ftAtt,
      fgPercent,
      threePt,
      ftPercent,
    },
    update: {
      games,
      ...averages,
      totalPts: totals.totalPts,
      totalReb: totals.totalReb,
      totalAst: totals.totalAst,
      totalBlk: totals.totalBlk,
      totalStl: totals.totalStl,
      totalMin: totals.totalMin,
      fgMade: totals.fgMade,
      fgAtt: totals.fgAtt,
      threeMade: totals.threeMade,
      threeAtt: totals.threeAtt,
      ftMade: totals.ftMade,
      ftAtt: totals.ftAtt,
      fgPercent,
      threePt,
      ftPercent,
    },
  });
}

/**
 * Get current season based on date
 * Basketball season runs from October to September
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // If we're before October, we're in the previous season
  if (month < 10) {
    return `${year - 1}-${year}`;
  }
  // If we're in October or later, we're in the new season
  return `${year}-${year + 1}`;
}

/**
 * Get list of available seasons
 */
export function getAvailableSeasons(): string[] {
  const seasons: string[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    seasons.push(`${year - 1}-${year}`);
  }

  return seasons;
}
