'use client'
import { useEffect, useState } from 'react'
import { getVacancy } from '../../actions'
import VacancyContent from './VacancyContent'

const ShowVacancyContent = ({ initialData, slugs }) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialData) return

    const fetchdataDetails = async () => {
      try {
        setLoading(true)
        const vacancyData = await getVacancy(slugs)
        setData(vacancyData.item)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchdataDetails()
  }, [slugs, initialData])

  if (loading) {
    return (
      <main className='flex items-center justify-center min-h-screen bg-white'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A6FA7]'></div>
      </main>
    )
  }

  if (error) {
    return (
      <main className='container mx-auto px-4 py-8 min-h-[60vh]'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl'>
          <p className='font-bold'>Error loading vacancy</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      </main>
    )
  }
  if (!data) {
    return (
      <main className='container mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Vacancy Not Found</h1>
          <p className='text-gray-500'>The vacancy you are looking for does not exist or has been removed.</p>
        </div>
      </main>
    )
  }

  return <VacancyContent vacancy={data} />
}
export default ShowVacancyContent
