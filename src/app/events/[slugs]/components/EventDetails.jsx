import GoogleMap from '@/app/colleges/[slugs]/components/GoogleMap'
import { FaMapMarkerAlt, FaCalendarCheck, FaClock, FaUserTie } from 'react-icons/fa'

const MetaItem = ({ icon: Icon, label, value }) => (
  <div className='flex items-start gap-4 py-4 border-b border-gray-50 last:border-0'>
    <div className='p-2 rounded-md bg-blue-50 text-[#0A6FA7]'>
      {Icon && <Icon size={16} />}
    </div>
    <div className='flex flex-col'>
      <span className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5'>{label}</span>
      <span className='text-sm font-semibold text-gray-800 leading-snug'>{value || 'N/A'}</span>
    </div>
  </div>
)

const formatTime = (time) => {
  if (!time) return 'N/A'
  try {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  } catch (e) {
    return time
  }
}

const EventDetails = ({ event }) => {
  let hostData = {}
  try {
    if (event?.event_host) {
      if (typeof event.event_host === 'string') {
        const firstPass = JSON.parse(event.event_host)
        hostData = typeof firstPass === 'string' ? JSON.parse(firstPass) : firstPass
      } else {
        hostData = event.event_host
      }
    }
  } catch (error) {
    console.error('Error parsing event host data:', error)
  }

  return (
    <div className='bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-6 lg:p-8 sticky top-28'>
      <h3 className='text-lg font-bold text-gray-900 mb-6 flex items-center gap-2'>
        Event Details
      </h3>

      <div className='flex flex-col'>
        <MetaItem icon={FaUserTie} label='Host' value={hostData?.host} />
        {hostData?.event_organizer && <MetaItem icon={FaUserTie} label='Organizer' value={hostData?.event_organizer} />}
        <MetaItem icon={FaCalendarCheck} label='Run Time' value={`${hostData?.start_date || 'N/A'} - ${hostData?.end_date || 'N/A'}`} />
        <MetaItem icon={FaClock} label='Time' value={formatTime(hostData?.time)} />
        {hostData?.location && <MetaItem icon={FaMapMarkerAlt} label='Address' value={hostData?.location} />}
      </div>

      {hostData?.map_url && (
        <div className='mt-8 pt-8 border-t border-gray-100'>
          <h3 className='text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2'>
            <FaMapMarkerAlt className='text-[#0A6FA7]' />
            Location
          </h3>
          <div className='w-full h-48 rounded-md overflow-hidden border border-gray-100 shadow-sm'>
            <GoogleMap mapUrl={hostData.map_url} />
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetails
