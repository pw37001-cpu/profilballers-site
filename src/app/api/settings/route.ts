import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Retrieve site settings
export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {}
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// PUT - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    let settings = await db.siteSettings.findFirst();
    
    if (!settings) {
      settings = await db.siteSettings.create({
        data
      });
    } else {
      settings = await db.siteSettings.update({
        where: { id: settings.id },
        data
      });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
