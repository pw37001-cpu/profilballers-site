import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    // Get session from database
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Delete expired session
      if (session) {
        await db.session.delete({ where: { id: sessionId } });
      }
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        playerId: session.user.playerId,
      },
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json({ user: null });
  }
}
