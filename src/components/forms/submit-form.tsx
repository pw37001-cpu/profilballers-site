"use client";

import { useState } from "react";
import { useAppStore, Club } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSITION_LABELS, LEVEL_LABELS, GENDER_LABELS } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Trophy,
  BarChart3,
  Link,
  FileText,
} from "lucide-react";

interface FormData {
  // Step 1: Identity
  lastName: string;
  firstName: string;
  gender: string;
  birthYear: string;
  height: string;
  weight: string;
  position: string;
  strongHand: string;
  city: string;
  country: string;
  photo: string;
  // Contact
  email: string;
  phone: string;
  // Step 2: Career
  currentClubId: string;
  history: { season: string; clubId: string }[];
  // Step 3: Statistics
  statistics: {
    season: string;
    games: string;
    pts: string;
    reb: string;
    ast: string;
    blk: string;
    stl: string;
    min: string;
  }[];
  // Step 4: Media
  youtubeLink: string;
  instagramLink: string;
  twitterLink: string;
  facebookLink: string;
  tiktokLink: string;
}

const initialFormData: FormData = {
  lastName: "",
  firstName: "",
  gender: "",
  birthYear: "",
  height: "",
  weight: "",
  position: "",
  strongHand: "",
  city: "",
  country: "Côte d'Ivoire",
  photo: "",
  email: "",
  phone: "",
  currentClubId: "",
  history: [],
  statistics: [],
  youtubeLink: "",
  instagramLink: "",
  twitterLink: "",
  facebookLink: "",
  tiktokLink: "",
};

const steps = [
  { id: 1, title: "Identité", icon: User },
  { id: 2, title: "Parcours", icon: Trophy },
  { id: 3, title: "Statistiques", icon: BarChart3 },
  { id: 4, title: "Médias", icon: Link },
  { id: 5, title: "Validation", icon: FileText },
];

export function SubmitForm() {
  const { clubs, setCurrentView } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addHistoryEntry = () => {
    setFormData((prev) => ({
      ...prev,
      history: [...prev.history, { season: "", clubId: "" }],
    }));
  };

  const updateHistoryEntry = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      history: prev.history.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      ),
    }));
  };

  const removeHistoryEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      history: prev.history.filter((_, i) => i !== index),
    }));
  };

  const addStatisticEntry = () => {
    setFormData((prev) => ({
      ...prev,
      statistics: [
        ...prev.statistics,
        { season: "", games: "", pts: "", reb: "", ast: "", blk: "", stl: "", min: "" },
      ],
    }));
  };

  const updateStatisticEntry = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      statistics: prev.statistics.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeStatisticEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      statistics: prev.statistics.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.lastName &&
          formData.firstName &&
          formData.gender &&
          formData.birthYear &&
          formData.height &&
          formData.position
        );
      case 2:
        return true; // Optional
      case 3:
        return true; // Optional
      case 4:
        return true; // Optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          gender: formData.gender,
          birthYear: parseInt(formData.birthYear),
          height: parseInt(formData.height),
          weight: formData.weight ? parseInt(formData.weight) : null,
          position: formData.position,
          strongHand: formData.strongHand || null,
          city: formData.city || null,
          country: formData.country,
          photo: formData.photo || null,
          email: formData.email || null,
          phone: formData.phone || null,
          currentClubId: formData.currentClubId || null,
          youtubeLink: formData.youtubeLink || null,
          instagramLink: formData.instagramLink || null,
          twitterLink: formData.twitterLink || null,
          facebookLink: formData.facebookLink || null,
          tiktokLink: formData.tiktokLink || null,
          history: formData.history.filter((h) => h.season && h.clubId),
          statistics: formData.statistics
            .filter((s) => s.season)
            .map((s) => ({
              season: s.season,
              games: parseInt(s.games) || 0,
              pts: parseFloat(s.pts) || 0,
              reb: parseFloat(s.reb) || 0,
              ast: parseFloat(s.ast) || 0,
              blk: parseFloat(s.blk) || 0,
              stl: parseFloat(s.stl) || 0,
              min: parseFloat(s.min) || 0,
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la soumission");
      }

      setSubmitSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Profil soumis !</h2>
            <p className="text-muted-foreground mb-6">
              Votre profil a été soumis avec succès. Il sera examiné par notre équipe
              avant d'être publié.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { setFormData(initialFormData); setCurrentStep(1); setSubmitSuccess(false); }}>
                Ajouter un autre profil
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("directory")}>
                Voir l'annuaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`ml-2 text-sm hidden md:inline ${
                  currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Form content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Koné"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Ibrahim"
                />
              </div>
              <div className="space-y-2">
                <Label>Genre *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => updateField("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
                <Label htmlFor="birthYear">Année de naissance *</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={formData.birthYear}
                  onChange={(e) => updateField("birthYear", e.target.value)}
                  placeholder="1998"
                  min="1970"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  placeholder="195"
                  min="150"
                  max="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="85"
                  min="40"
                  max="200"
                />
              </div>
              <div className="space-y-2">
                <Label>Poste *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(v) => updateField("position", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
                  value={formData.strongHand}
                  onValueChange={(v) => updateField("strongHand", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Droite</SelectItem>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="both">Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Abidjan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Côte d'Ivoire"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photo">URL Photo</Label>
                <Input
                  id="photo"
                  type="url"
                  value={formData.photo}
                  onChange={(e) => updateField("photo", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              {/* Contact Information */}
              <div className="md:col-span-2 mt-4 pt-4 border-t">
                <h4 className="font-medium mb-4">Contact (optionnel)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="joueur@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Career */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Club actuel</Label>
                <Select
                  value={formData.currentClubId}
                  onValueChange={(v) => updateField("currentClubId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name} ({club.level}) - {club.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Historique des clubs</Label>
                  <Button variant="outline" size="sm" onClick={addHistoryEntry}>
                    + Ajouter une saison
                  </Button>
                </div>
                {formData.history.map((entry, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Input
                      placeholder="Saison (2024-2025)"
                      value={entry.season}
                      onChange={(e) => updateHistoryEntry(index, "season", e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={entry.clubId}
                      onValueChange={(v) => updateHistoryEntry(index, "clubId", v)}
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
                      onClick={() => removeHistoryEntry(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Statistics */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Statistiques par saison (optionnelles)</Label>
                <Button variant="outline" size="sm" onClick={addStatisticEntry}>
                  + Ajouter une saison
                </Button>
              </div>
              {formData.statistics.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Input
                      placeholder="Saison (2024-2025)"
                      value={stat.season}
                      onChange={(e) => updateStatisticEntry(index, "season", e.target.value)}
                      className="w-48"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStatisticEntry(index)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Matchs</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={stat.games}
                        onChange={(e) => updateStatisticEntry(index, "games", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">PTS</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.pts}
                        onChange={(e) => updateStatisticEntry(index, "pts", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">REB</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.reb}
                        onChange={(e) => updateStatisticEntry(index, "reb", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">AST</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.ast}
                        onChange={(e) => updateStatisticEntry(index, "ast", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">BLK</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.blk}
                        onChange={(e) => updateStatisticEntry(index, "blk", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">STL</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.stl}
                        onChange={(e) => updateStatisticEntry(index, "stl", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">MIN</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={stat.min}
                        onChange={(e) => updateStatisticEntry(index, "min", e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              {formData.statistics.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune statistique ajoutée. Cliquez sur "+ Ajouter une saison" pour commencer.
                </p>
              )}
            </div>
          )}

          {/* Step 4: Media */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Ajoutez vos liens vers les réseaux sociaux pour que les recruteurs puissent vous contacter.
              </p>
              <div className="space-y-2">
                <Label htmlFor="youtubeLink">Lien YouTube</Label>
                <Input
                  id="youtubeLink"
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => updateField("youtubeLink", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramLink">Lien Instagram</Label>
                <Input
                  id="instagramLink"
                  type="url"
                  value={formData.instagramLink}
                  onChange={(e) => updateField("instagramLink", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterLink">Lien Twitter/X</Label>
                <Input
                  id="twitterLink"
                  type="url"
                  value={formData.twitterLink}
                  onChange={(e) => updateField("twitterLink", e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookLink">Lien Facebook</Label>
                <Input
                  id="facebookLink"
                  type="url"
                  value={formData.facebookLink}
                  onChange={(e) => updateField("facebookLink", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktokLink">Lien TikTok</Label>
                <Input
                  id="tiktokLink"
                  type="url"
                  value={formData.tiktokLink}
                  onChange={(e) => updateField("tiktokLink", e.target.value)}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Validation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-4">Résumé du profil</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nom:</span>{" "}
                    <span className="font-medium">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genre:</span>{" "}
                    <span className="font-medium">
                      {GENDER_LABELS[formData.gender] || formData.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Âge:</span>{" "}
                    <span className="font-medium">
                      {new Date().getFullYear() - parseInt(formData.birthYear)} ans
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Taille:</span>{" "}
                    <span className="font-medium">{formData.height} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Poste:</span>{" "}
                    <span className="font-medium">
                      {POSITION_LABELS[formData.position] || formData.position}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ville:</span>{" "}
                    <span className="font-medium">{formData.city || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="font-medium text-yellow-800 mb-2">Important</p>
                <p className="text-yellow-700">
                  En soumettant ce formulaire, vous consentez à la publication de ces
                  informations sur la plateforme profilballers.ci. Le profil sera examiné
                  par notre équipe avant publication.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!validateStep()}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep()}
              >
                {isSubmitting ? "Soumission..." : "Soumettre le profil"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
