"use client";

import { useAppStore, ViewType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CircleDot, Users, UserPlus, Settings } from "lucide-react";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { useState, useEffect } from "react";

const navItems: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: "home", label: "Accueil", icon: <CircleDot className="w-4 h-4" /> },
  { view: "directory", label: "Joueurs", icon: <Users className="w-4 h-4" /> },
];

export function Header() {
  const { currentView, setCurrentView } = useAppStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user?.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <CircleDot className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold hidden sm:inline">
            <span className="gradient-text">profilballers</span>
            <span>.ci</span>
          </span>
        </button>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(item.view)}
              className="gap-2"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
          {isAdmin && (
            <Button
              variant={currentView === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("admin")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Button>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView("submit")}
            className="hidden sm:flex"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un profil
          </Button>
          <UserDropdown />
        </div>

        {/* Mobile navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentView(item.view)}
            >
              {item.icon}
            </Button>
          ))}
          {isAdmin && (
            <Button
              variant={currentView === "admin" ? "default" : "ghost"}
              size="icon"
              onClick={() => setCurrentView("admin")}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
