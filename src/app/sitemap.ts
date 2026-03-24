import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://profilballers.ci'
  
  // Get all published players
  const players = await db.player.findMany({
    where: { status: 'published' },
    select: { id: true, updatedAt: true }
  })
  
  // Get all clubs
  const clubs = await db.club.findMany({
    select: { id: true, updatedAt: true }
  })

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/?view=directory`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?view=submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Player pages (dynamic)
  const playerPages = players.map((player) => ({
    url: `${baseUrl}/?player=${player.id}`,
    lastModified: player.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Club pages (dynamic)
  const clubPages = clubs.map((club) => ({
    url: `${baseUrl}/?club=${club.id}`,
    lastModified: club.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...playerPages, ...clubPages]
}
