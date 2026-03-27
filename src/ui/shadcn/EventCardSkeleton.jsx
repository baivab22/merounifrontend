import React from 'react'
import { Skeleton } from './Skeleton'

const EventCardSkeleton = () => {
    return (
        <div className='h-full flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden'>
            {/* Top Section: Image */}
            <div className='relative h-[200px] w-full'>
                <Skeleton className='w-full h-full' />
                <div className='absolute top-3 left-3'>
                    <Skeleton className='h-5 w-16 rounded-md' />
                </div>
            </div>

            <div className='p-5 flex flex-col flex-1 gap-3'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-6 w-full' />
                <Skeleton className='h-3 w-3/4' />
                
                <div className='mt-2 space-y-2'>
                    <Skeleton className='h-3 w-full' />
                    <Skeleton className='h-3 w-5/6' />
                </div>

                {/* Footer Section */}
                <div className='mt-auto pt-5 border-t border-gray-50 flex justify-between'>
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-4 w-12' />
                </div>
            </div>
        </div>
    )
}

export default EventCardSkeleton
