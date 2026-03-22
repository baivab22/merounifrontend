import axios from 'axios'
import React, { useEffect, useState } from 'react'

const LevelSection = ({ university }) => {
  const [loading, setLoading] = useState(true)
  const [filteredLevels, setFilteredLevels] = useState([])

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.baseUrl}/level?limit=20`)
      const data = response.data
      const allLevels = data.items || []

      if (Array.isArray(university?.levels) && university.levels.length > 0) {
        const filtered = allLevels.filter(level =>
          university.levels.includes(level.id)
        )
        setFilteredLevels(filtered)
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [university])

  if (loading || filteredLevels.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-6 bg-indigo-500 rounded-full' />
        <h2 className='text-xl font-bold text-gray-900'>Levels Offered</h2>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {filteredLevels.map(level => (
          <div
            key={level.id}
            className='bg-gray-50/50 p-4 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 font-bold text-gray-700'
          >
            {level.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LevelSection
