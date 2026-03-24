"use client";

import { useState, useEffect } from "react";
import { Player, Club } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { POSITION_LABELS, LEVEL_LABELS, GENDER_LABELS } from "@/lib/utils";
import {
  User,
  Trophy,
  BarChart3,
  Link as LinkIcon,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface PlayerEditorProps {
  player: Player | null;
  clubs: Club[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface HistoryEntry {
  id?: string;
  season: string;
  clubId: string;
  club?: { id: string; name: string; level: string };
}

interface StatEntry {
  id?: string;
  season: string;
  games: number;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  min: number;
  fgPercent: number | null;
  threePt: number | null;
  ftPercent: number | null;
  totalPts?: number;
  totalReb?: number;
  totalAst?: number;
  totalBlk?: number;
  totalStl?: number;
  totalMin?: number;
  fgMade?: number;
  fgAtt?: number;
  threeMade?: number;
  threeAtt?: number;
  ftMade?: number;
  ftAtt?: number;
}

export function PlayerEditor({
  player,
  clubs,
  open,
  onOpenChange,
  onSave,
}: PlayerEditorProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    birthYear: new Date().getFullYear() - 20,
    height: 180,
    weight: 75,
    position: "PG",
    strongHand: "right",
    photo: "",
    city: "",
    country: "Côte d'Ivoire",
    // Contact
    email: "",
    phone: "",
    // Social links
    youtubeLink: "",
    instagramLink: "",
    twitterLink: "",
    facebookLink: "",
    tiktokLink: "",
    currentClubId: "",
    status: "pending",
  });

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [statistics, setStatistics] = useState<StatEntry[]>([]);

  // Initialize form when player changes
  useEffect(() => {
    if (player) {
      setFormData({
        firstName: player.firstName || "",
        lastName: player.lastName || "",
        gender: player.gender || "M",
        birthYear: player.birthYear || new Date().getFullYear() - 20,
        height: player.height || 180,
        weight: player.weight || 75,
        position: player.position || "PG",
        strongHand: player.strongHand || "right",
        photo: player.photo || "",
        city: player.city || "",
        country: player.country || "Côte d'Ivoire",
        // Contact
        email: player.email || "",
        phone: player.phone || "",
        // Social links
        youtubeLink: player.youtubeLink || "",
        instagramLink: player.instagramLink || "",
        twitterLink: player.twitterLink || "",
        facebookLink: player.facebookLink || "",
        tiktokLink: player.tiktokLink || "",
        currentClubId: player.currentClubId || "",
        status: player.status || "pending",
      });

      setHistory(
        player.history?.map((h) => ({
          id: h.id,
          season: h.season,
          clubId: h.club?.id || "",
          club: h.club,
        })) || []
      );

      setStatistics(
        player.statistics?.map((s) => ({
          id: s.id,
          season: s.season,
          games: s.games || 0,
          pts: s.pts || 0,
          reb: s.reb || 0,
          ast: s.ast || 0,
          blk: s.blk || 0,
          stl: s.stl || 0,
          min: s.min || 0,
          fgPercent: s.fgPercent || null,
          threePt: s.threePt || null,
          ftPercent: s.ftPercent || null,
          totalPts: s.totalPts,
          totalReb: s.totalReb,
          totalAst: s.totalAst,
          totalBlk: s.totalBlk,
          totalStl: s.totalStl,
          totalMin: s.totalMin,
          fgMade: s.fgMade,
          fgAtt: s.fgAtt,
          threeMade: s.threeMade,
          threeAtt: s.threeAtt,
          ftMade: s.ftMade,
          ftAtt: s.ftAtt,
        })) || []
      );
    }
  }, [player]);

  // Save player
  const handleSave = async () => {
    if (!player) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          history: history.map((h) => ({
            season: h.season,
            clubId: h.clubId,
          })),
          statistics: statistics.map((s) => ({
            season: s.season,
            games: s.games,
            pts: s.pts,
            reb: s.reb,
            ast: s.ast,
            blk: s.blk,
            stl: s.stl,
            min: s.min,
            fgPercent: s.fgPercent,
            threePt: s.threePt,
            ftPercent: s.ftPercent,
            totalPts: s.totalPts,
            totalReb: s.totalReb,
            totalAst: s.totalAst,
            totalBlk: s.totalBlk,
            totalStl: s.totalStl,
            totalMin: s.totalMin,
            fgMade: s.fgMade,
            fgAtt: s.fgAtt,
            threeMade: s.threeMade,
            threeAtt: s.threeAtt,
            ftMade: s.ftMade,
            ftAtt: s.ftAtt,
          })),
        }),
      });

      if (response.ok) {
        onSave();
        onOpenChange(false);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving player:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // Add history entry
  const addHistory = () => {
    setHistory([
      ...history,
      {
        season: new Date().getFullYear() - 1 + "-" + new Date().getFullYear(),
        clubId: clubs[0]?.id || "",
      },
    ]);
  };

  // Remove history entry
  const removeHistory = (index: number) => {
    setHistory(history.filter((_, i) => i !== index));
  };

  // Update history entry
  const updateHistory = (index: number, field: string, value: string) => {
    const updated = [...history];
    (updated[index] as any)[field] = value;
    setHistory(updated);
  };

  // Add statistics entry
  const addStatistics = () => {
    setStatistics([
      ...statistics,
      {
        season: new Date().getFullYear() - 1 + "-" + new Date().getFullYear(),
        games: 0,
        pts: 0,
        reb: 0,
        ast: 0,
        blk: 0,
        stl: 0,
        min: 0,
        fgPercent: null,
        threePt: null,
        ftPercent: null,
      },
    ]);
  };

  // Remove statistics entry
  const removeStatistics = (index: number) => {
    setStatistics(statistics.filter((_, i) => i !== index));
  };

  // Update statistics entry
  const updateStatistics = (index: number, field: string, value: any) => {
    const updated = [...statistics];
    (updated[index] as any)[field] = value;
    setStatistics(updated);
  };

  // Generate seasons for dropdown
  const generateSeasons = () => {
    const seasons = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      seasons.push(`${currentYear - i - 1}-${currentYear - i}`);
    }
    return seasons;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Modifier le profil - {player?.firstName} {player?.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="identity" className="gap-2">
                <User className="w-4 h-4" />
                Identité
              </TabsTrigger>
              <TabsTrigger value="career" className="gap-2">
                <Trophy className="w-4 h-4" />
                Carrière
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <LinkIcon className="w-4 h-4" />
                Médias
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh]">
              {/* Identity Tab */}
              <TabsContent value="identity" className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gender: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GENDER_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Année de naissance</Label>
                    <Input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthYear: parseInt(e.target.value) || 2000,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taille (cm)</Label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height: parseInt(e.target.value) || 180,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poids (kg)</Label>
                    <Input
                      type="number"
                      value={formData.weight ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: e.target.value ? parseInt(e.target.value) : 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(v) =>
                        setFormData({ ...formData, position: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POSITION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Main forte</Label>
                    <Select
                      value={formData.strongHand || "right"}
                      onValueChange={(v) =>
                        setFormData({ ...formData, strongHand: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Droite</SelectItem>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="both">Ambidextre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Abidjan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="joueur@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+225 XX XX XX XX XX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Career Tab */}
              <TabsContent value="career" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label>Club actuel</Label>
                  <Select
                    value={formData.currentClubId || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, currentClubId: v || "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun club</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name} ({club.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Historique des clubs</CardTitle>
                      <Button variant="outline" size="sm" onClick={addHistory}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Aucun historique de club
                      </p>
                    ) : (
                      history.map((h, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <Select
                            value={h.season}
                            onValueChange={(v) =>
                              updateHistory(index, "season", v)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generateSeasons().map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={h.clubId}
                            onValueChange={(v) =>
                              updateHistory(index, "clubId", v)
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Club" />
                            </SelectTrigger>
                            <SelectContent>
                              {clubs.map((club) => (
                                <SelectItem key={club.id} value={club.id}>
                                  {club.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => removeHistory(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-4 pr-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Statistiques par saison
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addStatistics}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {statistics.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Aucune statistique enregistrée
                      </p>
                    ) : (
                      statistics.map((stat, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <Select
                                value={stat.season}
                                onValueChange={(v) =>
                                  updateStatistics(index, "season", v)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {generateSeasons().map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => removeStatistics(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Matchs</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  value={stat.games}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "games",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">MIN</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.min}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "min",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">PTS</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.pts}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "pts",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">REB</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.reb}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "reb",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div className="space-y-1">
                                <Label className="text-xs">AST</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.ast}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "ast",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">BLK</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.blk}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "blk",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">STL</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.stl}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "stl",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                              <div className="space-y-1">
                                <Label className="text-xs">FG%</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.fgPercent || ""}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "fgPercent",
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  placeholder="-"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">3P%</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.threePt || ""}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "threePt",
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  placeholder="-"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">FT%</Label>
                                <Input
                                  type="number"
                                  className="h-8"
                                  step="0.1"
                                  value={stat.ftPercent || ""}
                                  onChange={(e) =>
                                    updateStatistics(
                                      index,
                                      "ftPercent",
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  placeholder="-"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label>Photo (URL)</Label>
                  <Input
                    value={formData.photo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, photo: e.target.value })
                    }
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Réseaux sociaux</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>YouTube</Label>
                      <Input
                        value={formData.youtubeLink || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, youtubeLink: e.target.value })
                        }
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input
                        value={formData.instagramLink || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, instagramLink: e.target.value })
                        }
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Twitter / X</Label>
                      <Input
                        value={formData.twitterLink || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, twitterLink: e.target.value })
                        }
                        placeholder="https://x.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input
                        value={formData.facebookLink || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, facebookLink: e.target.value })
                        }
                        placeholder="https://facebook.com/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>TikTok</Label>
                      <Input
                        value={formData.tiktokLink || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, tiktokLink: e.target.value })
                        }
                        placeholder="https://tiktok.com/@username"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
