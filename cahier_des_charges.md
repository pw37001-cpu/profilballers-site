# Cahier des charges -- **ProfilBallers**

## 1. Contexte & objectifs

**Contexte**\
Le basketball ivoirien ne dispose pas actuellement d'une plateforme
centralisée mettant en valeur les joueurs et facilitant leur mise en
relation avec les acteurs du recrutement (clubs, académies, agents,
sélectionneurs). Cette absence limite la visibilité des talents et
complique le processus de détection et de recrutement.

**Objectif**\
Développer une application en ligne présentant un annuaire dynamique et
consultable de joueurs, enrichi de fiches profils détaillées (bio,
parcours, statistiques).\
L'outil devra permettre aux agents, clubs nationaux et internationaux,
et autres parties prenantes, d'identifier et d'évaluer rapidement les
talents.

**Cibles**

-   **Joueurs** (Championnat National N3, N2, N1 -- Hommes et Femmes) :
    création et mise à jour de leur profil.

-   **Clubs / Académies / Coaches / Agents** : recherche, filtrage,
    consultation et contact.

-   **Fédération nationale** : suivi et exploitation des données.

-   **Clubs internationaux** : sourcing de joueurs.

## 2. Périmètre fonctionnel

1.  **Fiches joueurs** : bio, photo, poste, taille, club actuel,
    parcours, statistiques par saison (à confirmer), liens médias
    (YouTube, réseaux sociaux).

2.  **Recherche & filtres** : par nom, poste, club, niveau (N1/N2/N3),
    genre.

## 3. Exigences fonctionnelles (User Stories)

### 3.1 Profils joueurs

-   **US J01** : Afficher une fiche joueur publique avec photo, nom,
    âge, poste, main forte, club actuel, liens sociaux et vidéos
    (optionnel).

-   **US J02** : Historique des clubs par saison (format AAAA--AAAA).

-   **US J03** : Statistiques par saison : PTS, REB, AST, BLK, 3PT%,
    MIN.

### 3.2 Recherche & filtres

-   **US S01** : Recherche par nom.

-   **US S02** : Filtres combinables : poste, club, ville, niveau,
    genre, main forte.

### 3.3 Soumission & modération

-   **US M01** : Formulaire de création/mise à jour de profil en 5
    étapes : Identité → Parcours → Statistiques → Médias → Validation.

    -   Champs requis : nom, genre, année de naissance, taille, poste,
        club actuel, ville/pays, photo.

    -   Uploads : photo, justificatifs -- licence ou pièce d'identité.

-   **US M02** : Gestion des consentements (A voir).

-   **US M04** : Détection de doublons (nom + date de naissance + club
    actuel) avec alerte et mécanisme de fusion assistée.

### 3.4 Back-office admin

-   **US A02** : Édition/correction de profils avec historique des
    révisions.

-   **US A04** : Gestion du référentiel des clubs.

-   **US A05** : Export CSV (profils publiés + stats + clubs) filtrable
    par période.

## 4. Modèle de données (MVP)

+-----------------------------------------------------------------------+
|   --                                                                  |
| --------------------------------------------------------------------- |
|   **Entité**     **Champs clés**                                      |
|   --                                                                  |
| ------------ -------------------------------------------------------- |
|   Joueur         nom, prénom, genre, date_naissance, taille, poste,   |
|                  photo, pays, liens (YouTube, Instagram, X)           |
|                                                                       |
|   Club           nom, ville, niveau (N1/N2/N3), logo                  |
|                                                                       |
|   Club passé     numéro, stats, saison (ex : 2024--2025)              |
|                                                                       |
|   Statistiques   saison, pts, reb, blk, ast, min                      |
|   --                                                                  |
| --------------------------------------------------------------------- |
+=======================================================================+
+-----------------------------------------------------------------------+

## 5. Risques & mesures préventives

+-----------------------------------------------------------------------+
|   ------------------------------------------------------------------- |
|   **Risque**         **Impact**    **Mesures préventives**            |
|   ------------------ ------------- ---------------------------------- |
|   Données            Perte de      Modération stricte, champs requis, |
|   incomplètes ou     crédibilité   contrôles ponctuels                |
|   inexactes                                                           |
|                                                                       |
|   Doublons de        Confusion     Détection automatique, fusion      |
|   profils                          assistée                           |
|                                                                       |
|   Charge             Lenteur de    Modèles, checklists,               |
|   administrative     publication   automatisations simples            |
|   élevée                                                              |
|                                                                       |
|   Problèmes liés au  Risques       Consentement explicite, procédure  |
|   droit à l'image    juridiques    de retrait rapide, floutage si     |
|                                    nécessaire                         |
|                                                                       |
|   Performance mobile Abandon       Optimisation images, pagination,   |
|   insuffisante       utilisateur   CDN                                |
|   ------------------------------------------------------------------- |
+=======================================================================+
+-----------------------------------------------------------------------+

## 7. Annexe -- Champs par écran

**Formulaire de soumission**

-   **Identité** : nom, prénom, genre, année de naissance, taille,
    poste, ville/pays, photo

-   **Parcours** : club actuel, historique (saison, club)

-   **Statistiques** (optionnelles) : saison, PTS, REB, AST, BLK, MIN

-   **Médias** : YouTube, réseaux sociaux

-   **Documents** : attestation de club, pièce d'identité ou licence
