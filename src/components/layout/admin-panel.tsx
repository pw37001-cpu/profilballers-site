"use client";

import { useState, useEffect } from "react";
import { useAppStore, Player, Club } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { POSITION_LABELS, LEVEL_LABELS, GENDER_LABELS, calculateAge } from "@/lib/utils";
import {
  Users,
  Building2,
  Download,
  Check,
  X,
  Trash2,
  Edit,
  Plus,
  Search,
  RefreshCw,
  Lock,
  Calendar,
  Bot,
  Settings,
} from "lucide-react";
import { MatchManager } from "@/components/admin/match-manager";
import { PlayerEditor } from "@/components/admin/player-editor";
import { AIAssistantChat } from "@/components/admin/ai-assistant-chat";
import { AISiteManagerChat } from "@/components/admin/ai-site-manager-chat";

interface UserData {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  playerId?: string | null;
}

export function AdminPanel() {
  const { adminTab, setAdminTab, clubs, setClubs, setPlayers, players, setAuthModalOpen, setCurrentView } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Club form state
  const [showClubDialog, setShowClubDialog] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubForm, setClubForm] = useState({ name: "", city: "", level: "N1" });

  // Player editor state
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showPlayerEditor, setShowPlayerEditor] = useState(false);

  // Export filters
  const [exportFilters, setExportFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // If not admin, redirect to home
          if (!data.user || data.user.role !== "admin") {
            setCurrentView("home");
          }
        } else {
          setCurrentView("home");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setCurrentView("home");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [setCurrentView]);

  // Fetch pending players
  const fetchPendingPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/players?status=all");
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clubs
  const fetchClubs = async () => {
    try {
      const response = await fetch("/api/clubs");
      const data = await response.json();
      setClubs(data.clubs);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  useEffect(() => {
    fetchPendingPlayers();
    fetchClubs();
  }, []);

  // Update player status
  const handleStatusUpdate = async (playerId: string, status: string) => {
    try {
      await fetch(`/api/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchPendingPlayers();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete player
  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;
    try {
      await fetch(`/api/players/${playerId}`, { method: "DELETE" });
      fetchPendingPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  // Create/Update club
  const handleClubSubmit = async () => {
    try {
      if (editingClub) {
        await fetch(`/api/clubs/${editingClub.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clubForm),
        });
      } else {
        await fetch("/api/clubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clubForm),
        });
      }
      setShowClubDialog(false);
      setEditingClub(null);
      setClubForm({ name: "", city: "", level: "N1" });
      fetchClubs();
    } catch (error) {
      console.error("Error saving club:", error);
    }
  };

  // Delete club
  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce club ?")) return;
    try {
      await fetch(`/api/clubs/${clubId}`, { method: "DELETE" });
      fetchClubs();
    } catch (error) {
      console.error("Error deleting club:", error);
    }
  };

  // Export CSV
  const handleExport = async () => {
    const params = new URLSearchParams();
    if (exportFilters.startDate) params.set("startDate", exportFilters.startDate);
    if (exportFilters.endDate) params.set("endDate", exportFilters.endDate);
    if (exportFilters.status) params.set("status", exportFilters.status);

    const response = await fetch(`/api/export?${params.toString()}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profilballers-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter players
  const filteredPlayers = players.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = players.filter((p) => p.status === "pending").length;
  const publishedCount = players.filter((p) => p.status === "published").length;

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Vérification des droits d'accès...</p>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Cette section est réservée aux administrateurs. Connectez-vous avec un compte administrateur pour accéder au panneau de gestion.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentView("home")}>
            Retour à l'accueil
          </Button>
          <Button onClick={() => setAuthModalOpen(true)}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={adminTab} onValueChange={(v: any) => setAdminTab(v)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="players" className="gap-2">
            <Users className="w-4 h-4" />
            Joueurs
            {pendingCount > 0 && (
              <Badge variant="default" className="ml-1">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="clubs" className="gap-2">
            <Building2 className="w-4 h-4" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2">
            <Calendar className="w-4 h-4" />
            Matchs
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="site-settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Site
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="gap-2">
            <Bot className="w-4 h-4" />
            IA
          </TabsTrigger>
        </TabsList>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchPendingPlayers}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{players.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
                <div className="text-sm text-muted-foreground">Publiés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
          </div>

          {/* Players list */}
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4 space-y-2">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {POSITION_LABELS[player.position]} • {calculateAge(player.birthYear)} ans
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        player.status === "published"
                          ? "success"
                          : player.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {player.status === "published"
                        ? "Publié"
                        : player.status === "pending"
                        ? "En attente"
                        : "Rejeté"}
                    </Badge>
                    {player.status === "pending" && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => handleStatusUpdate(player.id, "published")}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleStatusUpdate(player.id, "rejected")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingPlayer(player);
                        setShowPlayerEditor(true);
                      }}
                      title="Modifier le profil"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun joueur trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Clubs Tab */}
        <TabsContent value="clubs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Gestion des clubs</h3>
            <Button
              onClick={() => {
                setEditingClub(null);
                setClubForm({ name: "", city: "", level: "N1" });
                setShowClubDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un club
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <Card key={club.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{club.name}</h4>
                    <Badge variant="secondary">{club.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {club.city}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {(club as any)._count?.players || 0} joueurs
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingClub(club);
                          setClubForm({
                            name: club.name,
                            city: club.city,
                            level: club.level,
                          });
                          setShowClubDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => handleDeleteClub(club.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) =>
                      setExportFilters((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) =>
                      setExportFilters((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={exportFilters.status}
                    onValueChange={(v) =>
                      setExportFilters((f) => ({ ...f, status: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="published">Publiés</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exporter en CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <MatchManager />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AIAssistantChat />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Guide de l'Assistant IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">📝 Commandes courantes</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Combien de joueurs y a-t-il ?"</li>
                      <li>• "Montre les joueurs en attente"</li>
                      <li>• "Approuve [nom du joueur]"</li>
                      <li>• "Recherche [nom]"</li>
                      <li>• "Liste les clubs"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">✏️ Modifications</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Change la taille de [joueur] à 195cm"</li>
                      <li>• "Modifie le club de [joueur]"</li>
                      <li>• "Supprime [joueur]"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🏆 Clubs</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Ajoute un club [nom] à [ville]"</li>
                      <li>• "Liste les clubs par niveau"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Astuce :</strong> L'assistant comprend le langage naturel. 
                    Décrivez ce que vous voulez faire et il exécutera l'action appropriée.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Site Settings Tab with AI Manager */}
        <TabsContent value="site-settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <AISiteManagerChat />
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🎨 Modification de l'interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Couleurs</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Change la couleur en bleu"</li>
                      <li>• "Utilise le thème vert"</li>
                      <li>• "Couleur principale: violet"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Textes</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Modifie le titre du site"</li>
                      <li>• "Change le texte du hero"</li>
                      <li>• "Modifie le footer"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Contact</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Ajoute l'email contact"</li>
                      <li>• "Configure les réseaux sociaux"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📄 Pages personnalisées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Créez des pages via l'IA :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Crée une page À propos"</li>
                    <li>• "Ajoute une page Contact"</li>
                    <li>• "Crée une page Mentions légales"</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    🚀 <strong>Modifications instantanées</strong><br/>
                    <span className="text-muted-foreground">
                      Les changements sont appliqués immédiatement. 
                      Rafraîchissez la page pour voir les modifications.
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Club Dialog */}
      <Dialog open={showClubDialog} onOpenChange={setShowClubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClub ? "Modifier le club" : "Ajouter un club"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du club</Label>
              <Input
                value={clubForm.name}
                onChange={(e) => setClubForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ASC Treichville"
              />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={clubForm.city}
                onChange={(e) => setClubForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Abidjan"
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select
                value={clubForm.level}
                onValueChange={(v) => setClubForm((f) => ({ ...f, level: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClubDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleClubSubmit}>
              {editingClub ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Player Editor */}
      <PlayerEditor
        player={editingPlayer}
        clubs={clubs}
        open={showPlayerEditor}
        onOpenChange={setShowPlayerEditor}
        onSave={fetchPendingPlayers}
      />
    </div>
  );
}
