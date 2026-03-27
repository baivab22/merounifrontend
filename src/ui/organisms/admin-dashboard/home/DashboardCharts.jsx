'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import TopAgentsTable from './TopAgentsTable'

// Dynamically import charts with SSR disabled to fix ResponsiveContainer issues
const StudentEnrollmentGrowthChart = dynamic(
  () => import('@/ui/molecules/EnrollmentChart'),
  { ssr: false }
)

const DashboardCharts = ({
  enrollmentData,
  selectedYears = [],
  onYearsChange,
  topAgents = [],
  topAgentsLoading = false,
  onViewAll
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {mounted && (
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='w-full lg:w-1/2' style={{ minHeight: '450px', height: '450px' }}>
             <TopAgentsTable
              topAgents={topAgents}
              loading={topAgentsLoading}
              onViewAll={onViewAll}
            />
          </div>
          <div className='w-full lg:w-1/2' style={{ minHeight: '450px', height: '450px' }}>
            <StudentEnrollmentGrowthChart
              data={enrollmentData?.enrollmentGrowth}
              availableYears={enrollmentData?.availableYears || []}
              selectedYears={
                selectedYears.length > 0
                  ? selectedYears
                  : enrollmentData?.selectedYears || []
              }
              onYearsChange={onYearsChange}
            />
          </div>
        </div>
      )}

      {!mounted && (
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100/80 flex items-center justify-center' style={{ minHeight: '450px', height: '450px' }}>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          </div>
          <div className='w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100/80 flex items-center justify-center' style={{ minHeight: '450px', height: '450px' }}>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardCharts
