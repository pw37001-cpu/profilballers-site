"use client";

import { useState, useEffect } from "react";
import { useAppStore, Match, Player, PlayerMatchStats } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { getCurrentSeason, getAvailableSeasons } from "@/lib/stats-calculator";
import {
  Plus,
  Trash2,
  Edit,
  Trophy,
  Users,
  BarChart3,
  Save,
  RefreshCw,
} from "lucide-react";

interface MatchWithDetails extends Match {
  homeClub: { id: string; name: string; city: string; level: string };
  awayClub: { id: string; name: string; city: string; level: string };
  playerStats?: (PlayerMatchStats & { player: Player })[];
}

export function MatchManager() {
  const { clubs, players, setPlayers } = useAppStore();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchWithDetails | null>(null);

  // Match form
  const [matchForm, setMatchForm] = useState({
    date: new Date().toISOString().split("T")[0],
    season: getCurrentSeason(),
    homeClubId: "",
    awayClubId: "",
    homeScore: 0,
    awayScore: 0,
    venue: "",
    notes: "",
  });

  // Player stats form (for batch entry)
  const [playerStatsForm, setPlayerStatsForm] = useState<
    Record<string, Partial<PlayerMatchStats>>
  >({});

  // Filter state
  const [filterSeason, setFilterSeason] = useState(getCurrentSeason());
  const seasons = getAvailableSeasons();

  // Fetch matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matches?season=${filterSeason}`);
      const data = await response.json();
      setMatches(data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch players for stats entry
  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players?status=published");
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, [filterSeason]);

  // Create/Update match
  const handleMatchSubmit = async () => {
    try {
      if (editingMatch) {
        await fetch(`/api/matches/${editingMatch.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchForm),
        });
      } else {
        await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchForm),
        });
      }
      setShowMatchDialog(false);
      setEditingMatch(null);
      resetMatchForm();
      fetchMatches();
    } catch (error) {
      console.error("Error saving match:", error);
    }
  };

  // Delete match
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) return;
    try {
      await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
      fetchMatches();
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  // Save player stats
  const handleSaveStats = async () => {
    if (!selectedMatch) return;

    const playersArray = Object.entries(playerStatsForm).map(
      ([playerId, stats]) => ({
        playerId,
        ...stats,
      })
    );

    if (playersArray.length === 0) return;

    try {
      await fetch(`/api/matches/${selectedMatch.id}/stats/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players: playersArray }),
      });

      // Refresh match data
      const response = await fetch(`/api/matches/${selectedMatch.id}`);
      const data = await response.json();
      setSelectedMatch(data.match);
      setShowStatsDialog(false);
      setPlayerStatsForm({});
    } catch (error) {
      console.error("Error saving stats:", error);
    }
  };

  // Open match creation dialog
  const openCreateMatch = () => {
    setEditingMatch(null);
    resetMatchForm();
    setShowMatchDialog(true);
  };

  // Open match edit dialog
  const openEditMatch = (match: MatchWithDetails) => {
    setEditingMatch(match);
    setMatchForm({
      date: new Date(match.date).toISOString().split("T")[0],
      season: match.season,
      homeClubId: match.homeClubId,
      awayClubId: match.awayClubId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      venue: match.venue || "",
      notes: match.notes || "",
    });
    setShowMatchDialog(true);
  };

  // Open stats entry dialog
  const openStatsEntry = (match: MatchWithDetails) => {
    setSelectedMatch(match);
    // Initialize stats form with existing data
    const existingStats: Record<string, Partial<PlayerMatchStats>> = {};
    match.playerStats?.forEach((ps) => {
      existingStats[ps.playerId] = {
        min: ps.min,
        pts: ps.pts,
        reb: ps.reb,
        ast: ps.ast,
        blk: ps.blk,
        stl: ps.stl,
        to: ps.to,
        pf: ps.pf,
        fgMade: ps.fgMade,
        fgAtt: ps.fgAtt,
        threeMade: ps.threeMade,
        threeAtt: ps.threeAtt,
        ftMade: ps.ftMade,
        ftAtt: ps.ftAtt,
        plusMinus: ps.plusMinus,
      };
    });
    setPlayerStatsForm(existingStats);
    setShowStatsDialog(true);
  };

  // Reset match form
  const resetMatchForm = () => {
    setMatchForm({
      date: new Date().toISOString().split("T")[0],
      season: getCurrentSeason(),
      homeClubId: "",
      awayClubId: "",
      homeScore: 0,
      awayScore: 0,
      venue: "",
      notes: "",
    });
  };

  // Update player stats in form
  const updatePlayerStat = (
    playerId: string,
    field: string,
    value: number
  ) => {
    setPlayerStatsForm((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  // Filter players by clubs in the match
  const getMatchPlayers = () => {
    if (!selectedMatch) return { homePlayers: [], awayPlayers: [] };

    const homePlayers = players.filter(
      (p) => p.currentClubId === selectedMatch.homeClubId
    );
    const awayPlayers = players.filter(
      (p) => p.currentClubId === selectedMatch.awayClubId
    );

    return { homePlayers, awayPlayers };
  };

  // Stats input fields
  const statsFields = [
    { key: "min", label: "Min" },
    { key: "pts", label: "PTS" },
    { key: "reb", label: "REB" },
    { key: "ast", label: "AST" },
    { key: "stl", label: "STL" },
    { key: "blk", label: "BLK" },
    { key: "to", label: "TO" },
    { key: "pf", label: "PF" },
  ];

  const shootingFields = [
    { key: "fgMade", label: "FGM" },
    { key: "fgAtt", label: "FGA" },
    { key: "threeMade", label: "3PM" },
    { key: "threeAtt", label: "3PA" },
    { key: "ftMade", label: "FTM" },
    { key: "ftAtt", label: "FTA" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">Gestion des matchs</h3>
          <Select value={filterSeason} onValueChange={setFilterSeason}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchMatches}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateMatch}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau match
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{matches.length}</div>
            <div className="text-sm text-muted-foreground">Matchs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {matches.filter((m) => m.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Terminés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">
              {matches.filter((m) => m.status === "scheduled").length}
            </div>
            <div className="text-sm text-muted-foreground">À venir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {matches.reduce(
                (acc, m) => acc + (m.playerStats?.length || 0),
                0
              )}
            </div>
            <div className="text-sm text-muted-foreground">Fiches stats</div>
          </CardContent>
        </Card>
      </div>

      {/* Matches List */}
      <ScrollArea className="h-[500px] border rounded-lg">
        <div className="p-4 space-y-3">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun match trouvé pour cette saison
            </div>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Match Header */}
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <Badge
                          variant={
                            match.status === "completed"
                              ? "success"
                              : match.status === "scheduled"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {match.status === "completed"
                            ? "Terminé"
                            : match.status === "scheduled"
                            ? "À venir"
                            : match.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(match.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {match.venue && (
                          <span className="text-sm text-muted-foreground hidden sm:inline">
                            • {match.venue}
                          </span>
                        )}
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[100px]">
                            <p className="font-medium truncate">{match.homeClub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.homeClub.city}
                            </p>
                          </div>
                          <div className="text-2xl font-bold">
                            {match.homeScore}
                          </div>
                        </div>

                        <div className="text-muted-foreground">vs</div>

                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold">
                            {match.awayScore}
                          </div>
                          <div className="min-w-[100px]">
                            <p className="font-medium truncate">{match.awayClub.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.awayClub.city}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats count */}
                      {match.playerStats && match.playerStats.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {match.playerStats.length} fiches stats
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatsEntry(match)}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Stats
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditMatch(match)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDeleteMatch(match.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create/Edit Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMatch ? "Modifier le match" : "Nouveau match"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={matchForm.date}
                  onChange={(e) =>
                    setMatchForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Saison</Label>
                <Select
                  value={matchForm.season}
                  onValueChange={(v) =>
                    setMatchForm((f) => ({ ...f, season: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Club domicile</Label>
              <Select
                value={matchForm.homeClubId}
                onValueChange={(v) =>
                  setMatchForm((f) => ({ ...f, homeClubId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem
                      key={club.id}
                      value={club.id}
                      disabled={club.id === matchForm.awayClubId}
                    >
                      {club.name} ({club.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Club extérieur</Label>
              <Select
                value={matchForm.awayClubId}
                onValueChange={(v) =>
                  setMatchForm((f) => ({ ...f, awayClubId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem
                      key={club.id}
                      value={club.id}
                      disabled={club.id === matchForm.homeClubId}
                    >
                      {club.name} ({club.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score domicile</Label>
                <Input
                  type="number"
                  min="0"
                  value={matchForm.homeScore}
                  onChange={(e) =>
                    setMatchForm((f) => ({
                      ...f,
                      homeScore: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Score extérieur</Label>
                <Input
                  type="number"
                  min="0"
                  value={matchForm.awayScore}
                  onChange={(e) =>
                    setMatchForm((f) => ({
                      ...f,
                      awayScore: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lieu (optionnel)</Label>
              <Input
                value={matchForm.venue}
                onChange={(e) =>
                  setMatchForm((f) => ({ ...f, venue: e.target.value }))
                }
                placeholder="Palais des Sports de Treichville"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Input
                value={matchForm.notes}
                onChange={(e) =>
                  setMatchForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Match reporté, prolongation, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleMatchSubmit}
              disabled={!matchForm.homeClubId || !matchForm.awayClubId}
            >
              {editingMatch ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Entry Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="w-5 h-5" />
              Statistiques du match
              {selectedMatch && (
                <span className="text-muted-foreground font-normal">
                  - {selectedMatch.homeClub?.name} vs {selectedMatch.awayClub?.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[70vh]">
            {selectedMatch && (
              <div className="space-y-6 p-4">
                {/* Home Team Stats */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {selectedMatch.homeClub?.name} (Domicile)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 sticky left-0 bg-muted/50 min-w-[120px]">
                            Joueur
                          </th>
                          {statsFields.map((f) => (
                            <th key={f.key} className="p-2 w-14 text-center">
                              {f.label}
                            </th>
                          ))}
                          <th className="w-14 text-center p-2">FG%</th>
                          <th className="w-14 text-center p-2">3P%</th>
                          <th className="w-14 text-center p-2">FT%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getMatchPlayers().homePlayers.map((player) => {
                          const stats = playerStatsForm[player.id] || {};
                          const fgPct =
                            stats.fgAtt && stats.fgAtt > 0
                              ? Math.round(
                                  ((stats.fgMade || 0) / stats.fgAtt) * 100
                                )
                              : null;
                          const threePct =
                            stats.threeAtt && stats.threeAtt > 0
                              ? Math.round(
                                  ((stats.threeMade || 0) / stats.threeAtt) * 100
                                )
                              : null;
                          const ftPct =
                            stats.ftAtt && stats.ftAtt > 0
                              ? Math.round(
                                  ((stats.ftMade || 0) / stats.ftAtt) * 100
                                )
                              : null;

                          return (
                            <tr key={player.id} className="border-b">
                              <td className="p-2 sticky left-0 bg-background">
                                {player.firstName} {player.lastName}
                              </td>
                              {statsFields.map((f) => (
                                <td key={f.key} className="p-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    className="w-14 h-8 text-center"
                                    value={(stats as Record<string, number>)[f.key] || 0}
                                    onChange={(e) =>
                                      updatePlayerStat(
                                        player.id,
                                        f.key,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </td>
                              ))}
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {fgPct !== null ? `${fgPct}%` : "-"}
                              </td>
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {threePct !== null ? `${threePct}%` : "-"}
                              </td>
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {ftPct !== null ? `${ftPct}%` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                        {getMatchPlayers().homePlayers.length === 0 && (
                          <tr>
                            <td
                              colSpan={14}
                              className="p-4 text-center text-muted-foreground"
                            >
                              Aucun joueur de ce club dans la base
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shooting Stats - Home */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 sticky left-0 bg-muted/50 min-w-[120px]">
                          Tirs
                        </th>
                        {shootingFields.map((f) => (
                          <th key={f.key} className="p-2 w-14 text-center">
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getMatchPlayers().homePlayers.map((player) => {
                        const stats = playerStatsForm[player.id] || {};
                        return (
                          <tr key={`shooting-${player.id}`} className="border-b">
                            <td className="p-2 sticky left-0 bg-background">
                              {player.firstName} {player.lastName}
                            </td>
                            {shootingFields.map((f) => (
                              <td key={f.key} className="p-1">
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-14 h-8 text-center"
                                  value={(stats as Record<string, number>)[f.key] || 0}
                                  onChange={(e) =>
                                    updatePlayerStat(
                                      player.id,
                                      f.key,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Separator */}
                <div className="border-t-2 border-dashed my-4" />

                {/* Away Team Stats */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedMatch.awayClub?.name} (Extérieur)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 sticky left-0 bg-muted/50 min-w-[120px]">
                            Joueur
                          </th>
                          {statsFields.map((f) => (
                            <th key={f.key} className="p-2 w-14 text-center">
                              {f.label}
                            </th>
                          ))}
                          <th className="w-14 text-center p-2">FG%</th>
                          <th className="w-14 text-center p-2">3P%</th>
                          <th className="w-14 text-center p-2">FT%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getMatchPlayers().awayPlayers.map((player) => {
                          const stats = playerStatsForm[player.id] || {};
                          const fgPct =
                            stats.fgAtt && stats.fgAtt > 0
                              ? Math.round(
                                  ((stats.fgMade || 0) / stats.fgAtt) * 100
                                )
                              : null;
                          const threePct =
                            stats.threeAtt && stats.threeAtt > 0
                              ? Math.round(
                                  ((stats.threeMade || 0) / stats.threeAtt) * 100
                                )
                              : null;
                          const ftPct =
                            stats.ftAtt && stats.ftAtt > 0
                              ? Math.round(
                                  ((stats.ftMade || 0) / stats.ftAtt) * 100
                                )
                              : null;

                          return (
                            <tr key={player.id} className="border-b">
                              <td className="p-2 sticky left-0 bg-background">
                                {player.firstName} {player.lastName}
                              </td>
                              {statsFields.map((f) => (
                                <td key={f.key} className="p-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    className="w-14 h-8 text-center"
                                    value={(stats as Record<string, number>)[f.key] || 0}
                                    onChange={(e) =>
                                      updatePlayerStat(
                                        player.id,
                                        f.key,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </td>
                              ))}
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {fgPct !== null ? `${fgPct}%` : "-"}
                              </td>
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {threePct !== null ? `${threePct}%` : "-"}
                              </td>
                              <td className="text-center p-2 text-muted-foreground text-xs">
                                {ftPct !== null ? `${ftPct}%` : "-"}
                              </td>
                            </tr>
                          );
                        })}
                        {getMatchPlayers().awayPlayers.length === 0 && (
                          <tr>
                            <td
                              colSpan={14}
                              className="p-4 text-center text-muted-foreground"
                            >
                              Aucun joueur de ce club dans la base
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shooting Stats - Away */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 sticky left-0 bg-muted/50 min-w-[120px]">
                          Tirs
                        </th>
                        {shootingFields.map((f) => (
                          <th key={f.key} className="p-2 w-14 text-center">
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getMatchPlayers().awayPlayers.map((player) => {
                        const stats = playerStatsForm[player.id] || {};
                        return (
                          <tr key={`shooting-${player.id}`} className="border-b">
                            <td className="p-2 sticky left-0 bg-background">
                              {player.firstName} {player.lastName}
                            </td>
                            {shootingFields.map((f) => (
                              <td key={f.key} className="p-1">
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-14 h-8 text-center"
                                  value={(stats as Record<string, number>)[f.key] || 0}
                                  onChange={(e) =>
                                    updatePlayerStat(
                                      player.id,
                                      f.key,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveStats}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les statistiques
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
