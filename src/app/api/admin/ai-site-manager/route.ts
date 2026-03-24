import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

const SYSTEM_PROMPT = `Tu es l'assistant IA de ProfilBallers, capable de modifier l'interface et gérer le site complet.

CAPACITÉS:
1. **Gérer les joueurs** - CRUD complet sur les profils
2. **Gérer les clubs** - CRUD complet sur les clubs
3. **Modifier l'interface** - Titres, textes, couleurs, images
4. **Créer des pages** - Pages personnalisées
5. **Configuration du site** - Nom, description, contact, réseaux sociaux

FORMAT DE RÉPONSE POUR LES ACTIONS:
\`\`\`json
{
  "action": "nom_action",
  "params": { ... },
  "confirmation": "Message de confirmation"
}
\`\`\`

ACTIONS DISPONIBLES:

**JOUEURS:**
- list_players: Lister les joueurs (params: status, position, limit)
- get_player: Détails d'un joueur (params: name ou id)
- update_player: Modifier un joueur (params: id/name, champs...)
- delete_player: Supprimer un joueur (params: id/name)
- approve_player: Approuver un joueur (params: id/name)
- reject_player: Rejeter un joueur (params: id/name)

**CLUBS:**
- list_clubs: Lister les clubs
- add_club: Ajouter un club (params: name, city, level)
- update_club: Modifier un club (params: id/name, champs...)

**INTERFACE DU SITE:**
- get_settings: Obtenir les paramètres du site
- update_site_info: Modifier nom, description, logo (params: siteName, siteDescription, siteLogo)
- update_hero: Modifier la section hero (params: heroTitle, heroSubtitle, heroButtonText)
- update_colors: Modifier les couleurs (params: primaryColor, accentColor - utiliser: orange, amber, blue, green, red, purple, pink, teal, cyan)
- update_contact: Modifier les infos de contact (params: contactEmail, contactPhone, contactAddress)
- update_social: Modifier les liens sociaux (params: facebookUrl, twitterUrl, instagramUrl, youtubeUrl)
- update_footer: Modifier le texte du footer (params: footerText)
- update_features: Activer/désactiver des fonctionnalités (params: enableRegistration, enableSubmission, enableMatches)
- add_custom_css: Ajouter du CSS personnalisé (params: customCss)

**PAGES PERSONNALISÉES:**
- list_pages: Lister les pages personnalisées
- create_page: Créer une page (params: title, slug, content, showInMenu)
- update_page: Modifier une page (params: slug, title, content, isPublished, showInMenu)
- delete_page: Supprimer une page (params: slug)

**STATISTIQUES:**
- stats: Statistiques globales

EXEMPLES DE COMMANDES:
- "Change le titre du site en 'Basketball CI'"
- "Modifie la couleur principale en bleu"
- "Crée une page 'À propos' avec le contenu..."
- "Change le texte du hero en 'Les meilleurs talents'"
- "Ajoute le lien Facebook: https://facebook.com/..."
- "Désactive les inscriptions"
- "Modifie le footer avec '© 2025 Basketball Côte d'Ivoire'"`;

// Store conversation history per session
const conversations = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message requis" },
        { status: 400 }
      );
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
        actionResult = await executeAction(actionData);
        
        finalResponse = actionData.confirmation || `Action "${actionData.action}" exécutée avec succès.`;
        
        if (actionResult && typeof actionResult === "object") {
          finalResponse += `\n\n**Détails:**\n\`\`\`json\n${JSON.stringify(actionResult, null, 2)}\n\`\`\``;
        }
      } catch (e) {
        console.error("Error executing action:", e);
        finalResponse += `\n\n⚠️ Erreur lors de l'exécution: ${e instanceof Error ? e.message : 'Erreur inconnue'}`;
      }
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      actionExecuted: !!actionResult,
      actionResult
    });

  } catch (error) {
    console.error("AI Site Manager error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}

// Execute actions
async function executeAction(action: { action: string; params?: any }) {
  const { action: actionName, params = {} } = action;

  switch (actionName) {
    // ========== JOUEURS ==========
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
        players: players.map((p: any) => ({
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
        include: { currentClub: true }
      });

      if (!player) return { error: "Joueur non trouvé" };

      return {
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        position: player.position,
        height: player.height,
        weight: player.weight,
        status: player.status,
        club: player.currentClub?.name || "Sans club",
        email: player.email,
        phone: player.phone
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

      if (!playerId) return { error: "Joueur non trouvé" };

      const updated = await db.player.update({
        where: { id: playerId },
        data: updateData
      });

      return { success: true, player: `${updated.firstName} ${updated.lastName}` };
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

      if (!playerId) return { error: "Joueur non trouvé" };

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

      if (!playerId) return { error: "Joueur non trouvé ou déjà approuvé" };

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

      if (!playerId) return { error: "Joueur non trouvé" };

      const updated = await db.player.update({
        where: { id: playerId },
        data: { status: "rejected" }
      });

      return { success: true, player: `${updated.firstName} ${updated.lastName}` };
    }

    // ========== CLUBS ==========
    case "list_clubs": {
      const clubs = await db.club.findMany({
        include: { _count: { select: { players: true } } },
        orderBy: { name: "asc" }
      });

      return {
        count: clubs.length,
        clubs: clubs.map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          level: c.level,
          players: c._count.players
        }))
      };
    }

    case "add_club": {
      const { name, city, level } = params;
      if (!name || !city || !level) return { error: "Nom, ville et niveau requis" };

      const club = await db.club.create({
        data: { name, city, level }
      });

      return { success: true, club: club.name };
    }

    case "update_club": {
      const { id, name, ...updateData } = params;
      
      let clubId = id;
      if (!clubId && name) {
        const club = await db.club.findFirst({
          where: { name: { contains: name } }
        });
        clubId = club?.id;
      }

      if (!clubId) return { error: "Club non trouvé" };

      const updated = await db.club.update({
        where: { id: clubId },
        data: updateData
      });

      return { success: true, club: updated.name };
    }

    // ========== SITE SETTINGS ==========
    case "get_settings": {
      let settings = await db.siteSettings.findFirst();
      if (!settings) {
        settings = await db.siteSettings.create({ data: {} });
      }
      return settings;
    }

    case "update_site_info": {
      let settings = await db.siteSettings.findFirst();
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: params });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: params
        });
      }
      
      return { success: true, settings };
    }

    case "update_hero": {
      let settings = await db.siteSettings.findFirst();
      
      const updateData: any = {};
      if (params.heroTitle) updateData.heroTitle = params.heroTitle;
      if (params.heroSubtitle) updateData.heroSubtitle = params.heroSubtitle;
      if (params.heroButtonText) updateData.heroButtonText = params.heroButtonText;
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: updateData });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      }
      
      return { success: true, message: "Section hero mise à jour" };
    }

    case "update_colors": {
      let settings = await db.siteSettings.findFirst();
      
      const updateData: any = {};
      if (params.primaryColor) updateData.primaryColor = params.primaryColor;
      if (params.accentColor) updateData.accentColor = params.accentColor;
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: updateData });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      }
      
      return { success: true, message: `Couleurs mises à jour: primaire=${params.primaryColor || 'inchangé'}, accent=${params.accentColor || 'inchangé'}` };
    }

    case "update_contact": {
      let settings = await db.siteSettings.findFirst();
      
      const updateData: any = {};
      if (params.contactEmail !== undefined) updateData.contactEmail = params.contactEmail;
      if (params.contactPhone !== undefined) updateData.contactPhone = params.contactPhone;
      if (params.contactAddress !== undefined) updateData.contactAddress = params.contactAddress;
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: updateData });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      }
      
      return { success: true, message: "Informations de contact mises à jour" };
    }

    case "update_social": {
      let settings = await db.siteSettings.findFirst();
      
      const updateData: any = {};
      if (params.facebookUrl !== undefined) updateData.facebookUrl = params.facebookUrl;
      if (params.twitterUrl !== undefined) updateData.twitterUrl = params.twitterUrl;
      if (params.instagramUrl !== undefined) updateData.instagramUrl = params.instagramUrl;
      if (params.youtubeUrl !== undefined) updateData.youtubeUrl = params.youtubeUrl;
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: updateData });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      }
      
      return { success: true, message: "Liens sociaux mis à jour" };
    }

    case "update_footer": {
      let settings = await db.siteSettings.findFirst();
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: { footerText: params.footerText } });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: { footerText: params.footerText }
        });
      }
      
      return { success: true, message: "Footer mis à jour" };
    }

    case "update_features": {
      let settings = await db.siteSettings.findFirst();
      
      const updateData: any = {};
      if (params.enableRegistration !== undefined) updateData.enableRegistration = params.enableRegistration;
      if (params.enableSubmission !== undefined) updateData.enableSubmission = params.enableSubmission;
      if (params.enableMatches !== undefined) updateData.enableMatches = params.enableMatches;
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: updateData });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: updateData
        });
      }
      
      return { success: true, features: updateData };
    }

    case "add_custom_css": {
      let settings = await db.siteSettings.findFirst();
      
      if (!settings) {
        settings = await db.siteSettings.create({ data: { customCss: params.customCss } });
      } else {
        settings = await db.siteSettings.update({
          where: { id: settings.id },
          data: { customCss: params.customCss }
        });
      }
      
      return { success: true, message: "CSS personnalisé ajouté" };
    }

    // ========== CUSTOM PAGES ==========
    case "list_pages": {
      const pages = await db.customPage.findMany({
        orderBy: { createdAt: "desc" }
      });
      
      return {
        count: pages.length,
        pages: pages.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          isPublished: p.isPublished,
          showInMenu: p.showInMenu
        }))
      };
    }

    case "create_page": {
      const { title, slug, content, showInMenu } = params;
      
      if (!title || !slug || !content) {
        return { error: "Titre, slug et contenu requis" };
      }
      
      const page = await db.customPage.create({
        data: {
          title,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          content,
          showInMenu: showInMenu || false
        }
      });
      
      return { success: true, page: page.title, slug: page.slug };
    }

    case "update_page": {
      const { slug, ...updateData } = params;
      
      if (!slug) return { error: "Slug requis" };
      
      const page = await db.customPage.update({
        where: { slug },
        data: updateData
      });
      
      return { success: true, page: page.title };
    }

    case "delete_page": {
      const { slug } = params;
      
      if (!slug) return { error: "Slug requis" };
      
      await db.customPage.delete({ where: { slug } });
      
      return { success: true, message: "Page supprimée" };
    }

    // ========== STATS ==========
    case "stats": {
      const [totalPlayers, pendingPlayers, publishedPlayers, totalClubs, settings] = await Promise.all([
        db.player.count(),
        db.player.count({ where: { status: "pending" } }),
        db.player.count({ where: { status: "published" } }),
        db.club.count(),
        db.siteSettings.findFirst()
      ]);

      return {
        totalPlayers,
        pendingPlayers,
        publishedPlayers,
        totalClubs,
        siteName: settings?.siteName || "ProfilBallers",
        heroTitle: settings?.heroTitle
      };
    }

    default:
      return { error: `Action inconnue: ${actionName}` };
  }
}
