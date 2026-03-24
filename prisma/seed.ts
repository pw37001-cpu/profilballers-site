import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await db.user.upsert({
    where: { email: "admin@profilballers.ci" },
    update: {},
    create: {
      email: "admin@profilballers.ci",
      password: hashedPassword,
      name: "Administrateur",
      role: "admin",
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email} (password: admin123)`);

  // Create clubs
  const clubs = await Promise.all([
    db.club.create({
      data: { name: "ASC Treichville", city: "Abidjan", level: "N1" },
    }),
    db.club.create({
      data: { name: "ASEC Mimosas Basket", city: "Abidjan", level: "N1" },
    }),
    db.club.create({
      data: { name: "Africa Sports Basket", city: "Abidjan", level: "N1" },
    }),
    db.club.create({
      data: { name: "Stade d'Abidjan", city: "Abidjan", level: "N2" },
    }),
    db.club.create({
      data: { name: "JSK Basket", city: "Korhogo", level: "N2" },
    }),
    db.club.create({
      data: { name: "AS Tanda", city: "Tanda", level: "N3" },
    }),
    db.club.create({
      data: { name: "USC Bassam", city: "Grand-Bassam", level: "N2" },
    }),
    db.club.create({
      data: { name: "AS Dabou Basket", city: "Dabou", level: "N3" },
    }),
    db.club.create({
      data: { name: "Olympic Club d'Abidjan", city: "Abidjan", level: "N1" },
    }),
    db.club.create({
      data: { name: "COC Basket", city: "Abidjan", level: "N2" },
    }),
  ]);

  console.log(`✅ Created ${clubs.length} clubs`);

  // Create players with contact info and social media links
  const playersData = [
    {
      lastName: "Koné",
      firstName: "Ibrahim",
      gender: "M",
      birthYear: 1998,
      height: 198,
      weight: 92,
      position: "SF",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[0].id,
      email: "ibrahim.kone@email.com",
      phone: "+225 07 12 34 56 78",
      youtubeLink: "https://youtube.com/watch?v=ibrahim_highlights",
      instagramLink: "https://instagram.com/ibrahim_kone_bball",
      twitterLink: "https://x.com/ibrahim_kone",
      facebookLink: "https://facebook.com/ibrahim.kone.basket",
      tiktokLink: "https://tiktok.com/@ibrahim_kone",
      status: "published",
    },
    {
      lastName: "Diallo",
      firstName: "Fatou",
      gender: "F",
      birthYear: 2001,
      height: 182,
      weight: 70,
      position: "PG",
      strongHand: "both",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[1].id,
      email: "fatou.diallo@email.com",
      phone: "+225 05 98 76 54 32",
      instagramLink: "https://instagram.com/fatou_diallo_pg",
      twitterLink: "https://x.com/fatou_diallo",
      status: "published",
    },
    {
      lastName: "Touré",
      firstName: "Moussa",
      gender: "M",
      birthYear: 1996,
      height: 205,
      weight: 105,
      position: "C",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[2].id,
      email: "moussa.toure@email.com",
      phone: "+225 01 23 45 67 89",
      youtubeLink: "https://youtube.com/watch?v=moussa_dunks",
      instagramLink: "https://instagram.com/moussa_toure_center",
      status: "published",
    },
    {
      lastName: "Bamba",
      firstName: "Aïssata",
      gender: "F",
      birthYear: 1999,
      height: 175,
      weight: 65,
      position: "SG",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[1].id,
      email: "aissata.bamba@email.com",
      phone: "+225 07 11 22 33 44",
      instagramLink: "https://instagram.com/aissata_bamba_sg",
      facebookLink: "https://facebook.com/aissata.bamba",
      status: "published",
    },
    {
      lastName: "Coulibaly",
      firstName: "Adama",
      gender: "M",
      birthYear: 2000,
      height: 190,
      weight: 82,
      position: "PG",
      strongHand: "left",
      city: "Korhogo",
      country: "Côte d'Ivoire",
      currentClubId: clubs[4].id,
      email: "adama.coulibaly@email.com",
      phone: "+225 05 55 66 77 88",
      youtubeLink: "https://youtube.com/watch?v=adama_coulibaly",
      instagramLink: "https://instagram.com/adama_coulibaly_pg",
      tiktokLink: "https://tiktok.com/@adama_coulibaly",
      status: "published",
    },
    {
      lastName: "Yao",
      firstName: "Koffi",
      gender: "M",
      birthYear: 1997,
      height: 202,
      weight: 98,
      position: "PF",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[8].id,
      email: "koffi.yao@email.com",
      phone: "+225 01 99 88 77 66",
      instagramLink: "https://instagram.com/koffi_yao_pf",
      twitterLink: "https://x.com/koffi_yao",
      status: "published",
    },
    {
      lastName: "Kouassi",
      firstName: "Marie",
      gender: "F",
      birthYear: 2002,
      height: 185,
      weight: 72,
      position: "PF",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[1].id,
      email: "marie.kouassi@email.com",
      phone: "+225 07 44 33 22 11",
      instagramLink: "https://instagram.com/marie_kouassi_pf",
      facebookLink: "https://facebook.com/marie.kouassi.basket",
      tiktokLink: "https://tiktok.com/@marie_kouassi",
      status: "published",
    },
    {
      lastName: "Gnoumou",
      firstName: "Jean-Baptiste",
      gender: "M",
      birthYear: 1995,
      height: 195,
      weight: 88,
      position: "SG",
      strongHand: "right",
      city: "Grand-Bassam",
      country: "Côte d'Ivoire",
      currentClubId: clubs[6].id,
      email: "jb.gnoumou@email.com",
      phone: "+225 05 12 34 56 78",
      youtubeLink: "https://youtube.com/watch?v=jb_gnoumou",
      instagramLink: "https://instagram.com/jb_gnoumou_sg",
      twitterLink: "https://x.com/jb_gnoumou",
      status: "published",
    },
    {
      lastName: "Zadi",
      firstName: "Hervé",
      gender: "M",
      birthYear: 2001,
      height: 188,
      weight: 80,
      position: "PG",
      strongHand: "both",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[9].id,
      email: "herve.zadi@email.com",
      phone: "+225 01 87 65 43 21",
      instagramLink: "https://instagram.com/herve_zadi",
      tiktokLink: "https://tiktok.com/@herve_zadi",
      status: "published",
    },
    {
      lastName: "Kouadio",
      firstName: "Blandine",
      gender: "F",
      birthYear: 2000,
      height: 178,
      weight: 68,
      position: "SF",
      strongHand: "right",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[0].id,
      email: "blandine.kouadio@email.com",
      phone: "+225 07 22 33 44 55",
      instagramLink: "https://instagram.com/blandine_kouadio",
      facebookLink: "https://facebook.com/blandine.kouadio",
      status: "published",
    },
    {
      lastName: "Traoré",
      firstName: "Souleymane",
      gender: "M",
      birthYear: 1998,
      height: 203,
      weight: 100,
      position: "C",
      strongHand: "right",
      city: "Tanda",
      country: "Côte d'Ivoire",
      currentClubId: clubs[5].id,
      email: "souleymane.traore@email.com",
      phone: "+225 05 66 77 88 99",
      youtubeLink: "https://youtube.com/watch?v=traore_center",
      instagramLink: "https://instagram.com/souleymane_traore",
      status: "published",
    },
    {
      lastName: "Amani",
      firstName: "Joël",
      gender: "M",
      birthYear: 1999,
      height: 192,
      weight: 85,
      position: "SF",
      strongHand: "left",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      currentClubId: clubs[3].id,
      email: "joel.amani@email.com",
      phone: "+225 01 11 22 33 44",
      instagramLink: "https://instagram.com/joel_amani_sf",
      status: "pending",
    },
  ];

  for (const playerData of playersData) {
    const player = await db.player.create({
      data: playerData,
    });

    // Add history entries
    const historySeasons = ["2023-2024", "2022-2023", "2021-2022"];
    for (const season of historySeasons.slice(0, Math.floor(Math.random() * 3) + 1)) {
      const randomClub = clubs[Math.floor(Math.random() * clubs.length)];
      await db.playerHistory.create({
        data: {
          playerId: player.id,
          clubId: randomClub.id,
          season,
        },
      });
    }

    // Add statistics
    const statSeasons = ["2023-2024", "2022-2023"];
    for (const season of statSeasons) {
      await db.statistic.create({
        data: {
          playerId: player.id,
          season,
          games: Math.floor(Math.random() * 20) + 10,
          pts: Math.round((Math.random() * 20 + 5) * 10) / 10,
          reb: Math.round((Math.random() * 10 + 2) * 10) / 10,
          ast: Math.round((Math.random() * 6 + 1) * 10) / 10,
          blk: Math.round((Math.random() * 2) * 10) / 10,
          stl: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
          min: Math.round((Math.random() * 20 + 15) * 10) / 10,
          fgPercent: Math.round((Math.random() * 20 + 40) * 10) / 10,
          threePt: Math.round((Math.random() * 20 + 25) * 10) / 10,
          ftPercent: Math.round((Math.random() * 20 + 60) * 10) / 10,
        },
      });
    }
  }

  console.log(`✅ Created ${playersData.length} players with history, stats, contact info and social links`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
