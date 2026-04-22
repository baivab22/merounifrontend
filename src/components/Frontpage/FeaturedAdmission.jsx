import React from 'react'
import Link from 'next/link'
import CollegeCard from '@/ui/molecules/cards/CollegeCard'
import { getFeaturedCollege } from '@/app/[[...home]]/action'

const FeaturedAdmission = async () => {
  let data = []

  try {
    const response = await getFeaturedCollege()
    data = response.items || []
    console.log(data, 'Data data')
  } catch (error) {
    console.error('Error fetching Top Picks colleges:', error)
  }

  return (
    <>
      <div className='flex items-center justify-between mt-4 md:mt-6 mb-6'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>
          Top Picks
        </h2>
        <Link
          href='/admission'
          className='text-sm font-semibold text-[#387cae] hover:underline'
        >
          View All
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-fr'>
        {data.map((item) => (
          <CollegeCard key={item.id} college={item} />
        ))}
      </div>
    </>
  )
}

export default FeaturedAdmission
