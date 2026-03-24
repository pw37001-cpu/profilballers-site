"use client";

import { useAppStore, Player } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  POSITION_LABELS,
  LEVEL_LABELS,
  GENDER_LABELS,
  calculateAge,
  formatHeight,
} from "@/lib/utils";
import {
  MapPin,
  Ruler,
  Calendar,
  Youtube,
  Instagram,
  Twitter,
  Share2,
  ExternalLink,
  Trophy,
  BarChart3,
  Clock,
  Users,
  Mail,
  Phone,
  Facebook,
} from "lucide-react";

export function PlayerModal() {
  const { selectedPlayer, isPlayerModalOpen, setPlayerModalOpen } = useAppStore();

  if (!selectedPlayer) return null;

  const initials = `${selectedPlayer.firstName.charAt(0)}${selectedPlayer.lastName.charAt(0)}`;

  return (
    <Dialog open={isPlayerModalOpen} onOpenChange={setPlayerModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header with photo */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          {selectedPlayer.photo ? (
            <img
              src={selectedPlayer.photo}
              alt={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
              className="w-full h-full object-cover opacity-30"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background shadow-xl">
              {selectedPlayer.photo ? (
                <AvatarImage src={selectedPlayer.photo} />
              ) : null}
              <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => {
              // Share functionality
              navigator.share?.({
                title: `${selectedPlayer.firstName} ${selectedPlayer.lastName} - profilballers.ci`,
                url: window.location.href,
              });
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <DialogHeader className="px-6 pt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-2xl md:text-3xl">
              {selectedPlayer.firstName} {selectedPlayer.lastName.toUpperCase()}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge variant="default">
                {POSITION_LABELS[selectedPlayer.position] || selectedPlayer.position}
              </Badge>
              {selectedPlayer.currentClub?.level && (
                <Badge variant="secondary">{selectedPlayer.currentClub.level}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Quick info */}
          <div className="flex flex-wrap gap-4 md:gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {calculateAge(selectedPlayer.birthYear)} ans ({selectedPlayer.birthYear})
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              {formatHeight(selectedPlayer.height)}
              {selectedPlayer.weight && ` • ${selectedPlayer.weight} kg`}
            </span>
            {selectedPlayer.city && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedPlayer.city}, {selectedPlayer.country}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {GENDER_LABELS[selectedPlayer.gender] || selectedPlayer.gender}
            </span>
          </div>

          {/* Club */}
          {selectedPlayer.currentClub && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center">
                  {selectedPlayer.currentClub.logo ? (
                    <img
                      src={selectedPlayer.currentClub.logo}
                      alt={selectedPlayer.currentClub.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Trophy className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{selectedPlayer.currentClub.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlayer.currentClub.city} •{" "}
                    {LEVEL_LABELS[selectedPlayer.currentClub.level] || selectedPlayer.currentClub.level}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(selectedPlayer.email || selectedPlayer.phone) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contact</h4>
              <div className="flex flex-wrap gap-4">
                {selectedPlayer.email && (
                  <a
                    href={`mailto:${selectedPlayer.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedPlayer.email}
                  </a>
                )}
                {selectedPlayer.phone && (
                  <a
                    href={`tel:${selectedPlayer.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {selectedPlayer.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {(selectedPlayer.youtubeLink ||
            selectedPlayer.instagramLink ||
            selectedPlayer.twitterLink ||
            selectedPlayer.facebookLink ||
            selectedPlayer.tiktokLink) && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Réseaux sociaux</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlayer.youtubeLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedPlayer.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </a>
                  </Button>
                )}
                {selectedPlayer.instagramLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedPlayer.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {selectedPlayer.twitterLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedPlayer.twitterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {selectedPlayer.facebookLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedPlayer.facebookLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </a>
                  </Button>
                )}
                {selectedPlayer.tiktokLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={selectedPlayer.tiktokLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      TikTok
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Tabs for history and stats */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="w-4 h-4" />
                Parcours
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-4">
              {selectedPlayer.statistics && selectedPlayer.statistics.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {selectedPlayer.statistics.map((stat) => (
                      <div
                        key={stat.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">{stat.season}</span>
                          <span className="text-sm text-muted-foreground">
                            {stat.games} matchs
                          </span>
                        </div>
                        {/* Averages */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                              {stat.pts.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">PTS</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {stat.reb.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">REB</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">
                              {stat.ast.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">AST</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {stat.blk.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">BLK</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {stat.stl.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">STL</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">
                              {stat.min.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">MIN</p>
                          </div>
                        </div>
                        {/* Shooting percentages */}
                        {(stat.fgPercent || stat.threePt || stat.ftPercent) && (
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            {stat.fgPercent && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">FG:</span>
                                <span className="font-medium">{stat.fgPercent.toFixed(1)}%</span>
                                {stat.fgMade !== undefined && stat.fgAtt !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    ({stat.fgMade}/{stat.fgAtt})
                                  </span>
                                )}
                              </div>
                            )}
                            {stat.threePt && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">3PT:</span>
                                <span className="font-medium">{stat.threePt.toFixed(1)}%</span>
                                {stat.threeMade !== undefined && stat.threeAtt !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    ({stat.threeMade}/{stat.threeAtt})
                                  </span>
                                )}
                              </div>
                            )}
                            {stat.ftPercent && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">FT:</span>
                                <span className="font-medium">{stat.ftPercent.toFixed(1)}%</span>
                                {stat.ftMade !== undefined && stat.ftAtt !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    ({stat.ftMade}/{stat.ftAtt})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Totals */}
                        {stat.totalPts !== undefined && stat.totalPts > 0 && (
                          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                            <span className="font-medium">Totaux:</span>{" "}
                            {stat.totalPts} pts, {stat.totalReb} reb, {stat.totalAst} ast, {stat.totalMin} min
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune statistique disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {selectedPlayer.history && selectedPlayer.history.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="relative pl-6 border-l-2 border-primary/20 ml-4 space-y-4">
                    {selectedPlayer.history.map((h, index) => (
                      <div key={h.id} className="relative">
                        <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary" />
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="font-semibold">{h.season}</p>
                          <p className="text-sm text-muted-foreground">
                            {h.club.name} •{" "}
                            {LEVEL_LABELS[h.club.level] || h.club.level}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun parcours enregistré</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
