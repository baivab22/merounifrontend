'use client'
import Loading from '../../../ui/molecules/Loading'
import Cardlist from './components/Cardlist'
import Description from './components/Description'
import Hero from './components/Hero'
import ShareSection from '@/ui/organisms/common/ShareSection'

import EventDetails from './components/EventDetails'

const EventContent = ({ event, relatedEvents }) => {
  return (
    <div className='bg-white min-h-screen'>
      {!event ? (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <Loading />
        </div>
      ) : (
        <main className='animate-in fade-in duration-700'>
          <Hero event={event} />

          <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12 flex flex-col lg:flex-row gap-12'>
            <div className='flex-1 md:w-3/4 min-w-0'>
              <Description event={event} />
            </div>

            {/* Sidebar with event details */}
            <div className='w-full md:w-1/4'>
              <EventDetails event={event} />
            </div>
          </div>

          <div className='max-w-[1600px] mx-auto px-6 md:px-16'>
            <div className='h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-16'></div>
          </div>

          <div className='px-6 md:px-16 my-14 max-w-[1600px] mx-auto'>
            <Cardlist events={relatedEvents} />
          </div>

          <ShareSection title={event?.title} type='event' />
        </main>
      )}

    </div>
  )
}

export default EventContent
