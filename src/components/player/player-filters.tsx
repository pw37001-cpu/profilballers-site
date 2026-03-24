"use client";

import { useAppStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { POSITION_LABELS, LEVEL_LABELS, GENDER_LABELS } from "@/lib/utils";

export function PlayerFilters() {
  const { filters, setFilters, resetFilters, clubs } = useAppStore();

  const hasActiveFilters =
    filters.search ||
    filters.position ||
    filters.level ||
    filters.gender ||
    filters.clubId;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Position */}
        <Select
          value={filters.position || undefined}
          onValueChange={(value) => setFilters({ position: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Poste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les postes</SelectItem>
            {Object.entries(POSITION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level */}
        <Select
          value={filters.level || undefined}
          onValueChange={(value) => setFilters({ level: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender */}
        <Select
          value={filters.gender || undefined}
          onValueChange={(value) => setFilters({ gender: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {Object.entries(GENDER_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Club */}
        <Select
          value={filters.clubId || undefined}
          onValueChange={(value) => setFilters({ clubId: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clubs</SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id}>
                {club.name} ({club.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
