import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://profilballers.ci"),
  title: {
    default: "ProfilBallers.ci - Annuaire du Basketball Ivoirien | Joueurs N1 N2 N3",
    template: "%s | ProfilBallers.ci"
  },
  description: "Découvrez les talents du basketball ivoirien. L'annuaire officiel des joueurs de N1, N2 et N3 de Côte d'Ivoire. Profils, statistiques, parcours et recrutement basket CI.",
  keywords: [
    "basketball Côte d'Ivoire",
    "joueur basket ivoirien",
    "recrutement basket CI",
    "N1 N2 N3 basket",
    "profil basketball",
    "statistiques basket",
    "club basket Abidjan",
    "joueur basket africain",
    "championnat ivoirien basket",
    "ProfilBallers"
  ],
  authors: [{ name: "ProfilBallers.ci", url: "https://profilballers.ci" }],
  creator: "ProfilBallers",
  publisher: "ProfilBallers.ci",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "https://profilballers.ci",
    siteName: "ProfilBallers.ci",
    title: "ProfilBallers.ci - Annuaire du Basketball Ivoirien",
    description: "Découvrez les talents du basketball ivoirien. L'annuaire officiel des joueurs de N1, N2 et N3 de Côte d'Ivoire.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProfilBallers.ci - Annuaire du Basketball Ivoirien",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProfilBallers.ci - Annuaire du Basketball Ivoirien",
    description: "Découvrez les talents du basketball ivoirien. Joueurs N1, N2, N3.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // À remplacer après inscription Google Search Console
  },
  alternates: {
    canonical: "https://profilballers.ci",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ProfilBallers.ci",
  "url": "https://profilballers.ci",
  "description": "Annuaire officiel des joueurs de basketball de Côte d'Ivoire",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://profilballers.ci/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ProfilBallers.ci",
    "url": "https://profilballers.ci",
    "logo": {
      "@type": "ImageObject",
      "url": "https://profilballers.ci/logo.png"
    }
  },
  "inLanguage": "fr-CI"
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "ProfilBallers.ci",
  "description": "Plateforme de recrutement et de mise en valeur des joueurs de basketball ivoirien",
  "url": "https://profilballers.ci",
  "sport": "Basketball",
  "location": {
    "@type": "Country",
    "name": "Côte d'Ivoire"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Theme Color */}
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
