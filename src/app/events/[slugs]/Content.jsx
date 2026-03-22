'use client'
import Banner from '@/app/blogs/[slugs]/components/Banner'
import Loading from '../../../ui/molecules/Loading'
import Cardlist from './components/Cardlist'
import Description from './components/Description'
import Hero from './components/Hero'
import ShareSection from '@/ui/organisms/common/ShareSection'

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

          <div className='max-w-[1200px] mx-auto px-6 py-10'>
            <Banner />
          </div>

          <Description event={event} />

          <Cardlist events={relatedEvents} />

          <ShareSection title={event?.title} type='event' />
        </main>
      )}

    </div>
  )
}

export default EventContent
