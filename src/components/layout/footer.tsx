"use client";

import { useAppStore } from "@/lib/store";
import { CircleDot, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { setCurrentView } = useAppStore();

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <CircleDot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                <span className="gradient-text">profilballers</span>
                <span>.ci</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              La plateforme de référence pour le recrutement basketball en Côte d'Ivoire. 
              Découvrez les talents de N1, N2 et N3.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView("directory")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Annuaire des joueurs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("submit")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Ajouter un profil
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("admin")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                contact@profilballers.ci
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +225 XX XX XX XX
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Abidjan, Côte d'Ivoire
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} profilballers.ci. Tous droits réservés.</p>
          <p className="mt-1">
            Développé pour la Fédération Ivoirienne de Basketball
          </p>
        </div>
      </div>
    </footer>
  );
}
