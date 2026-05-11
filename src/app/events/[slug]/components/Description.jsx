import HTMLRenderer from '@/ui/HTMLRenderer'
import GoogleMap from '@/app/colleges/[slug]/components/GoogleMap'
import { FaMapMarkerAlt, FaCalendarCheck, FaClock, FaUserTie } from 'react-icons/fa'

const Description = ({ event }) => {
  return (
    <div className='w-full'>
      <section>
        <h2 className='text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3'>
          <span className='w-1.5 h-8 bg-[#0A6FA7] rounded-full'></span>
          About This Event
        </h2>
        <HTMLRenderer html={event?.content} />
      </section>
    </div>
  )
}


export default Description
