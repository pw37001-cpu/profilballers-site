import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Export players to CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const status = searchParams.get("status") || "published";

    const where: any = {};
    
    if (status !== "all") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const players = await db.player.findMany({
      where,
      include: {
        currentClub: true,
        statistics: {
          orderBy: { season: "desc" },
          take: 1,
        },
      },
      orderBy: {
        lastName: "asc",
      },
    });

    // Generate CSV
    const headers = [
      "Nom",
      "Prénom",
      "Genre",
      "Année de naissance",
      "Taille (cm)",
      "Poids (kg)",
      "Poste",
      "Main forte",
      "Ville",
      "Pays",
      "Club actuel",
      "Niveau club",
      "Ville club",
      "Statut",
      "PTS",
      "REB",
      "AST",
      "BLK",
      "MIN",
      "Saison stats",
      "YouTube",
      "Instagram",
      "Twitter",
      "Date création",
    ];

    const rows = players.map((p) => [
      p.lastName,
      p.firstName,
      p.gender === "M" ? "Homme" : "Femme",
      p.birthYear,
      p.height,
      p.weight || "",
      p.position,
      p.strongHand || "",
      p.city || "",
      p.country,
      p.currentClub?.name || "",
      p.currentClub?.level || "",
      p.currentClub?.city || "",
      p.status,
      p.statistics[0]?.pts || "",
      p.statistics[0]?.reb || "",
      p.statistics[0]?.ast || "",
      p.statistics[0]?.blk || "",
      p.statistics[0]?.min || "",
      p.statistics[0]?.season || "",
      p.youtubeLink || "",
      p.instagramLink || "",
      p.twitterLink || "",
      p.createdAt.toISOString().split("T")[0],
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="profilballers-ci-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
