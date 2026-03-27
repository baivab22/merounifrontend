'use client'

import React from 'react'

const TopAgentsTable = ({ topAgents, loading, onViewAll }) => {
  return (
    <div className='bg-white rounded-3xl shadow-sm border border-gray-100/80 p-6 lg:p-8 flex flex-col h-full transition-all hover:shadow-md'>
      <div className="flex justify-between items-center mb-6">
        <h2 className='text-lg font-black text-gray-900 tracking-tight'>
          Top Performing Agents
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
          >
            View All
          </button>
        )}
      </div>
      {loading ? (
        <div className='flex items-center justify-center flex-1'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
        </div>
      ) : topAgents.length === 0 ? (
        <p className='text-gray-500 text-center py-8 font-medium'>No agents found</p>
      ) : (
        <div className='overflow-x-auto overflow-y-auto flex-1 pr-2 custom-scrollbar'>
          <table className='w-full'>
            <thead className='sticky top-0 bg-white z-10'>
              <tr className='border-b border-gray-100'>
                <th className='text-left pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                  Rank
                </th>
                <th className='text-left pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                  Agent Name
                </th>
                <th className='text-left pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                  Email
                </th>
                <th className='text-right pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                  Referrals
                </th>
                <th className='text-right pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {topAgents.map((item, index) => (
                <tr
                  key={item.agent_id}
                  className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group'
                >
                  <td className='py-4'>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className='py-4 text-sm font-bold text-gray-900'>
                    {item.agent?.fullName || 'Unknown Agent'}
                  </td>
                  <td className='py-4 text-xs font-medium text-gray-500'>
                    {item.agent?.email || '-'}
                  </td>
                  <td className='py-4 text-sm text-gray-900 text-right font-black tabular-nums'>
                    {item.referralCount}
                  </td>
                  <td className='py-4 text-right'>
                    <span className='inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-wider'>
                      {item.totalScore} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TopAgentsTable
