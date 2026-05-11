import { getUnexpiredEvents } from '@/app/events/action'
import { formatDate } from '@/utils/date.util'
import Image from 'next/image'
import Link from 'next/link'

const Event = async () => {
  let events = []

  try {
    const data = await getUnexpiredEvents()
    events = data.items?.slice(0, 3) || []
  } catch (error) {
    console.error('Failed to fetch events:', error)
  }

  const getEventDate = (event) => {
    // Try to get date from event_host
    if (event.event_host) {
      try {
        const eventHost =
          typeof event.event_host === 'string'
            ? JSON.parse(event.event_host)
            : event.event_host
        if (eventHost?.start_date) {
          return formatDate(eventHost.start_date)
        }
      } catch (error) {
        // If parsing fails, continue to other options
      }
    }
    // Fallback to createdAt if available
    if (event.createdAt) {
      return formatDate(event.createdAt)
    }
    return 'Date TBA'
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className='py-8 md:py-10 bg-white'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>
          Events
        </h2>
        <Link href='/events' className='text-sm font-semibold text-[#387cae] hover:underline'>
          View All
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full'>
        {events.map((event, index) => (
          <Link
            href={`/events/${event.slug}`}
            key={event.id || index}
            className='group'
          >
            <div className='bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col'>
              {/* Event Image */}
              <div className='relative w-full h-48 md:h-56 overflow-hidden bg-gray-100'>
                <Image
                  src={event.image || '/images/logo.png'}
                  alt={event.title || 'Event Image'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={
                    event.image
                      ? 'object-cover group-hover:scale-105 transition-transform duration-300'
                      : 'object-contain p-4 group-hover:scale-105 transition-transform duration-300'
                  }
                />
              </div>

              {/* Event Content */}
              <div className='p-4 flex flex-col flex-1'>
                <h3 className='font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                  {event.title || 'Event Title'}
                </h3>
                <p className='text-sm text-gray-600 font-medium'>
                  {getEventDate(event)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Event
