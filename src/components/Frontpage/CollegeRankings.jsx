import React from 'react'
import CollegeRankingsClient from './CollegeRankingsClient'

const CollegeRankings = async () => {
  let rankings = []

  try {
    const response = await fetch(
      `${process.env.baseUrl}/college-ranking?limit=100`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }
      }
    )
    if (response.ok) {
      const data = await response.json()
      rankings = data.items || []
    }
  } catch (error) {
    console.error('Error fetching college rankings:', error)
  }

  if (rankings.length === 0) {
    return null
  }

  return <CollegeRankingsClient rankings={rankings} />
}

export default CollegeRankings
