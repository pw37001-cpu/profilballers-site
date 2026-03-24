import { create } from "zustand";

// Player type
export interface Player {
  id: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthYear: number;
  height: number;
  weight?: number;
  position: string;
  strongHand?: string;
  photo?: string;
  city?: string;
  country: string;
  // Contact information
  email?: string;
  phone?: string;
  // Social media links
  youtubeLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  status: string;
  currentClubId?: string;
  currentClub?: {
    id: string;
    name: string;
    city: string;
    level: string;
    logo?: string;
  };
  history?: {
    id: string;
    season: string;
    club: {
      id: string;
      name: string;
      level: string;
    };
  }[];
  statistics?: {
    id: string;
    season: string;
    games: number;
    pts: number;
    reb: number;
    ast: number;
    blk: number;
    stl: number;
    fgPercent?: number;
    threePt?: number;
    ftPercent?: number;
    min: number;
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
  }[];
}

// Club type
export interface Club {
  id: string;
  name: string;
  city: string;
  level: string;
  logo?: string;
}

// Match type
export interface Match {
  id: string;
  date: string;
  season: string;
  homeScore: number;
  awayScore: number;
  status: string;
  venue?: string;
  notes?: string;
  homeClubId: string;
  awayClubId: string;
  homeClub?: Club;
  awayClub?: Club;
  playerStats?: PlayerMatchStats[];
}

// Player Match Stats type
export interface PlayerMatchStats {
  id: string;
  matchId: string;
  playerId: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  to: number;
  pf: number;
  fgMade: number;
  fgAtt: number;
  threeMade: number;
  threeAtt: number;
  ftMade: number;
  ftAtt: number;
  plusMinus: number;
  eff: number;
  player?: Player;
}

// Filter type
export interface Filters {
  search: string;
  position: string;
  level: string;
  gender: string;
  clubId: string;
  city: string;
}

// View type
export type ViewType = "home" | "directory" | "submit" | "admin" | "profile";

// App state
interface AppState {
  // Views
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Players
  players: Player[];
  selectedPlayer: Player | null;
  setPlayers: (players: Player[]) => void;
  setSelectedPlayer: (player: Player | null) => void;

  // Clubs
  clubs: Club[];
  setClubs: (clubs: Club[]) => void;

  // Filters
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  // UI
  isPlayerModalOpen: boolean;
  setPlayerModalOpen: (open: boolean) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Auth Modal
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Admin
  adminTab: "players" | "clubs" | "export" | "matches" | "ai-assistant" | "site-settings";
  setAdminTab: (tab: "players" | "clubs" | "export" | "matches" | "ai-assistant" | "site-settings") => void;
}

const defaultFilters: Filters = {
  search: "",
  position: "",
  level: "",
  gender: "",
  clubId: "",
  city: "",
};

export const useAppStore = create<AppState>((set) => ({
  // Views
  currentView: "home",
  setCurrentView: (view) => set({ currentView: view }),

  // Players
  players: [],
  selectedPlayer: null,
  setPlayers: (players) => set({ players }),
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),

  // Clubs
  clubs: [],
  setClubs: (clubs) => set({ clubs }),

  // Filters
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  // UI
  isPlayerModalOpen: false,
  setPlayerModalOpen: (open) => set({ isPlayerModalOpen: open }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Auth Modal
  isAuthModalOpen: false,
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  // Admin
  adminTab: "players",
  setAdminTab: (tab) => set({ adminTab: tab }),
}));
