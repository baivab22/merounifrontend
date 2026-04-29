'use server'

const BASE_URL = process.env.baseUrl

export async function getAllRankings() {
  try {
    const response = await fetch(`${BASE_URL}/college-ranking?limit=100`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    
    if (!response.ok) throw new Error('Failed to fetch rankings')
    
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('getAllRankings error:', error)
    return []
  }
}

export async function getRankingsByDegreeSlug(slug) {
  try {
    const rankings = await getAllRankings()
    // Find the degree group that matches the slug
    const degreeGroup = rankings.find(g => g.degree?.slug === slug)
    return degreeGroup || null
  } catch (error) {
    console.error('getRankingsByDegreeSlug error:', error)
    return null
  }
}
