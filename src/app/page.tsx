"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/player/player-card";
import { PlayerFilters } from "@/components/player/player-filters";
import { PlayerModal } from "@/components/player/player-modal";
import { SubmitForm } from "@/components/forms/submit-form";
import { AdminPanel } from "@/components/layout/admin-panel";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  CircleDot,
  Users,
  Trophy,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

// Home View Component
function HomeView() {
  const { setCurrentView } = useAppStore();
  const [stats, setStats] = useState({ players: 0, clubs: 0, cities: 0 });

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const [playersRes, clubsRes] = await Promise.all([
          fetch("/api/players?status=published"),
          fetch("/api/clubs"),
        ]);
        const playersData = await playersRes.json();
        const clubsData = await clubsRes.json();
        setStats({
          players: playersData.players.length,
          clubs: clubsData.clubs.length,
          cities: Array.from(new Set(clubsData.clubs.map((c: any) => c.city))).length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative court-pattern py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Plateforme officielle du basketball ivoirien
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez les{" "}
            <span className="gradient-text">talents</span> du basketball
            ivoirien
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            L'annuaire des joueurs de N1, N2 et N3. Trouvez les meilleurs
            talents, suivez leurs statistiques et connectez-vous avec les
            acteurs du basketball ivoirien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setCurrentView("directory")}>
              <Search className="w-5 h-5 mr-2" />
              Explorer les joueurs
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentView("submit")}
            >
              <Users className="w-5 h-5 mr-2" />
              Ajouter un profil
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-1">{stats.players}</div>
              <div className="text-muted-foreground">Joueurs référencés</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-1">{stats.clubs}</div>
              <div className="text-muted-foreground">Clubs partenaires</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-1">{stats.cities}</div>
              <div className="text-muted-foreground">Villes couvertes</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pourquoi profilballers.ci ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une plateforme complète pour les joueurs, clubs et recruteurs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recherche avancée</h3>
              <p className="text-muted-foreground text-sm">
                Filtrez par poste, niveau, club, ville et bien plus pour
                trouver exactement le profil que vous cherchez.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CircleDot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fiches détaillées</h3>
              <p className="text-muted-foreground text-sm">
                Bio, parcours, statistiques par saison, liens médias : toutes
                les informations sur chaque joueur.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recrutement facilité</h3>
              <p className="text-muted-foreground text-sm">
                Connectez-vous avec les talents émergents et les joueurs
                confirmés du championnat ivoirien.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Vous êtes un joueur ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Créez votre profil gratuitement et augmentez votre visibilité
              auprès des clubs et recruteurs.
            </p>
            <Button size="lg" onClick={() => setCurrentView("submit")}>
              Créer mon profil
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Directory View Component
function DirectoryView() {
  const { players, setPlayers, filters, isLoading, setLoading, clubs, setClubs } =
    useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch clubs first if not loaded
        if (clubs.length === 0) {
          const clubsRes = await fetch("/api/clubs");
          const clubsData = await clubsRes.json();
          setClubs(clubsData.clubs);
        }

        // Build query params
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.position) params.set("position", filters.position);
        if (filters.level) params.set("level", filters.level);
        if (filters.gender) params.set("gender", filters.gender);
        if (filters.clubId) params.set("clubId", filters.clubId);
        if (filters.city) params.set("city", filters.city);
        params.set("status", "published");

        const response = await fetch(`/api/players?${params.toString()}`);
        const data = await response.json();
        setPlayers(data.players);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Annuaire des joueurs</h1>
        <p className="text-muted-foreground">
          Découvrez les talents du basketball ivoirien
        </p>
      </div>

      <PlayerFilters />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucun joueur trouvé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Essayez de modifier vos filtres
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {players.length} joueur{players.length > 1 ? "s" : ""} trouvé
            {players.length > 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Main Page Component
export default function Page() {
  const { currentView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Header */}
      <Header />

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentView === "home" && <HomeView />}
        {currentView === "directory" && <DirectoryView />}
        {currentView === "submit" && <SubmitForm />}
        {currentView === "admin" && <AdminPanel />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Player Modal */}
      <PlayerModal />

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
}
