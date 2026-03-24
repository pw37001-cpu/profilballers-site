"use client";

import { useAppStore, Player } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { POSITION_LABELS, LEVEL_LABELS, calculateAge, formatHeight } from "@/lib/utils";
import { MapPin, Ruler, Calendar } from "lucide-react";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { setSelectedPlayer, setPlayerModalOpen } = useAppStore();

  const handleClick = () => {
    setSelectedPlayer(player);
    setPlayerModalOpen(true);
  };

  const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;

  return (
    <Card
      className="player-card cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Photo section */}
        <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
          {player.photo ? (
            <img
              src={player.photo}
              alt={`${player.firstName} ${player.lastName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Avatar className="w-24 h-24 bg-muted">
              <AvatarFallback className="text-3xl font-bold text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          {/* Position badge */}
          <Badge className="absolute top-3 left-3" variant="default">
            {POSITION_LABELS[player.position] || player.position}
          </Badge>
          {/* Level badge */}
          {player.currentClub?.level && (
            <Badge className="absolute top-3 right-3" variant="secondary">
              {player.currentClub.level}
            </Badge>
          )}
        </div>

        {/* Info section */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {player.firstName} {player.lastName.toUpperCase()}
            </h3>
            {player.currentClub && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {player.currentClub.name}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {calculateAge(player.birthYear)} ans
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              {formatHeight(player.height)}
            </span>
          </div>

          {/* Latest stats preview */}
          {player.statistics && player.statistics.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="stat-badge bg-primary/10 text-primary">
                {player.statistics[0].pts.toFixed(1)} PTS
              </span>
              <span className="stat-badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {player.statistics[0].reb.toFixed(1)} REB
              </span>
              <span className="stat-badge bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {player.statistics[0].ast.toFixed(1)} AST
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
