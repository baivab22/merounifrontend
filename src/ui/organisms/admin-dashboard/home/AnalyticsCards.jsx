'use client'

import React from 'react'
import UserCard from '@/ui/molecules/cards/UserCard'

const AnalyticsCards = ({ analytics, loading }) => {
  const cards = [
    { type: 'TOTAL USERS', value: analytics?.totalUsers },
    { type: 'AGENTS', value: analytics?.totalAgents },
    { type: 'COLLEGES', value: analytics?.totalColleges },
    { type: 'SCHOOLS', value: analytics?.totalSchools },
    { type: 'UNIVERSITIES', value: analytics?.totalUniversities },
    { type: 'CONSULTANCIES', value: analytics?.totalConsultancies },
    { type: 'EVENTS', value: analytics?.totalEvents },
    { type: 'REFERRALS', value: analytics?.totalReferrals },
    { type: 'BLOGS', value: analytics?.totalBlogs },
    { type: 'MATERIALS', value: analytics?.totalMaterials }
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
      {cards.map((card) => (
        <UserCard
          key={card.type}
          type={card.type}
          value={card.value}
          loading={loading}
        />
      ))}
    </div>
  )
}

export default AnalyticsCards
