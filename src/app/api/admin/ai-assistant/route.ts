import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Tu es l'assistant IA de ProfilBallers, une plateforme de gestion de joueurs de basketball ivoirien.

Tu peux aider l'administrateur à:
1. **Gérer les joueurs** - Ajouter, modifier, supprimer des profils de joueurs
2. **Gérer les clubs** - Ajouter, modifier des clubs
3. **Voir les statistiques** - Consulter les données des joueurs
4. **Modérer le contenu** - Approuver ou rejeter les profils en attente

INSTRUCTIONS IMPORTANTES:
- Réponds toujours en français
- Sois concis et professionnel
- Quand l'utilisateur demande une action, réponds avec un JSON structuré

FORMAT DE RÉPONSE POUR LES ACTIONS:
Si l'utilisateur demande d'effectuer une action, réponds avec un JSON dans ce format:
\`\`\`json
{
  "action": "nom_action",
  "params": { ... },
  "confirmation": "Message de confirmation à afficher"
}
\`\`\`

ACTIONS DISPONIBLES:
- list_players: Lister les joueurs (params: status, position, limit)
- get_player: Obtenir détails d'un joueur (params: name ou id)
- update_player: Modifier un joueur (params: id, champs à modifier)
- delete_player: Supprimer un joueur (params: id ou name)
- approve_player: Approuver un joueur (params: id ou name)
- reject_player: Rejeter un joueur (params: id ou name)
- add_club: Ajouter un club (params: name, city, level)
- list_clubs: Lister les clubs
- stats: Obtenir des statistiques globales
- search_players: Rechercher des joueurs (params: query)

Exemples:
- "Montre les joueurs en attente" → list_players avec status="pending"
- "Combien de joueurs y a-t-il?" → stats
- "Approuve Jean Kodjo" → approve_player avec name="Jean Kodjo"
- "Change la taille de Kone à 195cm" → update_player

Si tu ne comprends pas la demande, demande des clarifications.`;

// Store conversation history per session
const conversations = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, executeAction } = await request.json();

    if (!message && !executeAction) {
      return NextResponse.json(
        { error: "Message ou action requis" },
        { status: 400 }
      );
    }

    // If executing an action directly
    if (executeAction) {
      const result = await executeDatabaseAction(executeAction);
      return NextResponse.json({ success: true, result });
    }

    // Get or create conversation history
    let history = conversations.get(sessionId) || [];
    
    // Initialize ZAI
    const zai = await ZAI.create();

    // Prepare messages
    const messages = [
      { role: "assistant" as const, content: SYSTEM_PROMPT },
      ...history,
      { role: "user" as const, content: message }
    ];

    // Get completion
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" }
    });

    const aiResponse = completion.choices[0]?.message?.content || "Je n'ai pas pu traiter votre demande.";

    // Update history
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: aiResponse });
    
    // Keep only last 20 messages to avoid context overflow
    if (history.length > 20) {
      history = history.slice(-20);
    }
    conversations.set(sessionId, history);

    // Check if response contains an action to execute
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    let actionResult = null;
    let finalResponse = aiResponse;

    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[1]);
        actionResult = await executeDatabaseAction(actionData);
        
        // Replace JSON block with confirmation
        finalResponse = actionData.confirmation || `Action "${actionData.action}" exécutée avec succès.`;
        
        if (actionResult) {
          finalResponse += `\n\n**Résultat:**\n${JSON.stringify(actionResult, null, 2)}`;
        }
      } catch (e) {
        console.error("Error executing action:", e);
      }
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      actionExecuted: !!actionResult,
      actionResult
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}

// Execute database actions
async function executeDatabaseAction(action: { action: string; params?: any }) {
  const { action: actionName, params = {} } = action;

  switch (actionName) {
    case "list_players": {
      const where: any = {};
      if (params.status) where.status = params.status;
      if (params.position) where.position = params.position;
      
      const players = await db.player.findMany({
        where,
        take: params.limit || 20,
        include: { currentClub: true },
        orderBy: { createdAt: "desc" }
      });
      
      return {
        count: players.length,
        players: players.map((p: { id: string; firstName: string; lastName: string; position: string; status: string; currentClub: { name: string } | null }) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          position: p.position,
          status: p.status,
          club: p.currentClub?.name || "Sans club"
        }))
      };
    }

    case "get_player": {
      const where: any = {};
      if (params.id) where.id = params.id;
      else if (params.name) {
        const nameParts = params.name.split(" ");
        where.OR = [
          { firstName: { contains: nameParts[0] } },
          { lastName: { contains: nameParts[nameParts.length - 1] } }
        ];
      }

      const player = await db.player.findFirst({
        where,
        include: {
          currentClub: true,
          statistics: { take: 3, orderBy: { season: "desc" } },
          history: { include: { club: true }, take: 5 }
        }
      });

      if (!player) {
        return { error: "Joueur non trouvé" };
      }

      return {
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        position: player.position,
        height: player.height,
        weight: player.weight,
        birthYear: player.birthYear,
        status: player.status,
        club: player.currentClub?.name || "Sans club",
        email: player.email,
        phone: player.phone,
        city: player.city,
        country: player.country
      };
    }

    case "update_player": {
      const { id, name, ...updateData } = params;
      
      let playerId = id;
      if (!playerId && name) {
        const player = await db.player.findFirst({
          where: {
            OR: [
              { firstName: { contains: name.split(" ")[0] } },
              { lastName: { contains: name.split(" ").pop() } }
            ]
          }
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return { error: "Joueur non trouvé" };
      }

      const updated = await db.player.update({
        where: { id: playerId },
        data: updateData
      });

      return {
        success: true,
        player: `${updated.firstName} ${updated.lastName}`,
        updated: Object.keys(updateData)
      };
    }

    case "delete_player": {
      const { id, name } = params;
      
      let playerId = id;
      if (!playerId && name) {
        const player = await db.player.findFirst({
          where: {
            OR: [
              { firstName: { contains: name.split(" ")[0] } },
              { lastName: { contains: name.split(" ").pop() } }
            ]
          }
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return { error: "Joueur non trouvé" };
      }

      await db.player.delete({ where: { id: playerId } });
      return { success: true, message: "Joueur supprimé" };
    }

    case "approve_player": {
      const { id, name } = params;
      
      let playerId = id;
      if (!playerId && name) {
        const player = await db.player.findFirst({
          where: {
            status: "pending",
            OR: [
              { firstName: { contains: name.split(" ")[0] } },
              { lastName: { contains: name.split(" ").pop() } }
            ]
          }
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return { error: "Joueur non trouvé ou déjà approuvé" };
      }

      const updated = await db.player.update({
        where: { id: playerId },
        data: { status: "published" }
      });

      return { success: true, player: `${updated.firstName} ${updated.lastName}` };
    }

    case "reject_player": {
      const { id, name } = params;
      
      let playerId = id;
      if (!playerId && name) {
        const player = await db.player.findFirst({
          where: {
            status: "pending",
            OR: [
              { firstName: { contains: name.split(" ")[0] } },
              { lastName: { contains: name.split(" ").pop() } }
            ]
          }
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return { error: "Joueur non trouvé" };
      }

      const updated = await db.player.update({
        where: { id: playerId },
        data: { status: "rejected" }
      });

      return { success: true, player: `${updated.firstName} ${updated.lastName}` };
    }

    case "add_club": {
      const { name, city, level } = params;
      
      if (!name || !city || !level) {
        return { error: "Nom, ville et niveau requis" };
      }

      const club = await db.club.create({
        data: { name, city, level }
      });

      return { success: true, club: club.name };
    }

    case "list_clubs": {
      const clubs = await db.club.findMany({
        include: { _count: { select: { players: true } } },
        orderBy: { name: "asc" }
      });

      return {
        count: clubs.length,
        clubs: clubs.map((c: { id: string; name: string; city: string; level: string; _count: { players: number } }) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          level: c.level,
          players: c._count.players
        }))
      };
    }

    case "stats": {
      const [totalPlayers, pendingPlayers, publishedPlayers, totalClubs] = await Promise.all([
        db.player.count(),
        db.player.count({ where: { status: "pending" } }),
        db.player.count({ where: { status: "published" } }),
        db.club.count()
      ]);

      const playersByPosition = await db.player.groupBy({
        by: ["position"],
        _count: true
      });

      return {
        totalPlayers,
        pendingPlayers,
        publishedPlayers,
        totalClubs,
        byPosition: playersByPosition.reduce((acc: Record<string, number>, p: { position: string; _count: number }) => {
          acc[p.position] = p._count;
          return acc;
        }, {} as Record<string, number>)
      };
    }

    case "search_players": {
      const { query } = params;
      
      const players = await db.player.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { city: { contains: query } }
          ]
        },
        take: 10,
        include: { currentClub: true }
      });

      return {
        count: players.length,
        players: players.map((p: { id: string; firstName: string; lastName: string; position: string; status: string; currentClub: { name: string } | null }) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          position: p.position,
          club: p.currentClub?.name || "Sans club",
          status: p.status
        }))
      };
    }

    default:
      return { error: `Action inconnue: ${actionName}` };
  }
}
