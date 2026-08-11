'use client'

import React from 'react'
import { cn } from '@/app/lib/utils'

const RankingChip = ({ label, rank, className }) => {
  if (rank === null || rank === undefined || rank === '') return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-none',
        label === 'QS'
          ? 'bg-[#387cae]/10 text-[#1c5a83] border border-[#387cae]/20'
          : 'bg-[#c2410c]/10 text-[#9a3412] border border-[#c2410c]/20',
        className
      )}
      title={`${label} World University Ranking: #${rank}`}
    >
      <span
        className={cn(
          'w-1 h-1 rounded-full',
          label === 'QS' ? 'bg-[#387cae]' : 'bg-[#c2410c]'
        )}
      />
      {label} #{rank}
    </span>
  )
}

const UniversityRankings = ({
  university,
  universities,
  className,
  chipClassName
}) => {
  const list = Array.isArray(universities) ? universities : []

  if (university) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5',
          className
        )}
      >
        <RankingChip
          label='QS'
          rank={university.qs_ranking}
          className={chipClassName}
        />
        <RankingChip
          label='THE'
          rank={university.the_ranking}
          className={chipClassName}
        />
      </div>
    )
  }

  if (list.length === 0) return null

  const hasAnyRanking = list.some(
    (u) => u?.qs_ranking != null || u?.the_ranking != null
  )
  if (!hasAnyRanking) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5',
        className
      )}
    >
      {list.map((u) => {
        const hasRanking = u?.qs_ranking != null || u?.the_ranking != null
        if (!hasRanking) return null
        return (
          <span
            key={u?.id || u?.slug || u?.fullname}
            className='inline-flex flex-wrap items-center gap-1.5'
          >
            <RankingChip
              label='QS'
              rank={u?.qs_ranking}
              className={chipClassName}
            />
            <RankingChip
              label='THE'
              rank={u?.the_ranking}
              className={chipClassName}
            />
          </span>
        )
      })}
    </div>
  )
}

export default UniversityRankings
