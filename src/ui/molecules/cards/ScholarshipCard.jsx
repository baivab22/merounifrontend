import Link from 'next/link'
import { Calendar, Award, ArrowRight, Clock, Banknote } from 'lucide-react'

const formatAmount = (amount) => {
  if (!amount) return null
  const num = parseFloat(amount)
  return Number.isNaN(num) ? amount : `Rs. ${num.toLocaleString()}`
}

const formatDeadline = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getTimeLeft = (deadline) => {
  if (!deadline) return null
  const now = new Date()
  const end = new Date(deadline)
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Expired'
  if (days === 0) return 'Ends Today'
  if (days === 1) return 'Ends Tomorrow'
  if (days <= 7) return `Only ${days} days left`
  return null
}

const ScholarshipCard = ({ scholarship }) => {
  const amountDisplay = formatAmount(scholarship.amount)
  const deadlineDisplay = formatDeadline(scholarship.applicationDeadline)
  const timeLeft = getTimeLeft(scholarship.applicationDeadline)

  const isExpired = scholarship.applicationDeadline
    ? new Date(scholarship.applicationDeadline) < new Date()
    : false

  return (
    <article className='group bg-white rounded-3xl border border-gray-100 p-6 flex flex-col hover:border-sky-200 hover:shadow-lg transition-all duration-300 h-full'>
      <div className='flex justify-between items-start mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#0A6FA7]'>
            <Award className='w-5 h-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-[10px] uppercase tracking-widest text-[#0A6FA7] font-bold'>Scholarship</span>
            <div className='flex items-center gap-2'>
              {isExpired ? (
                <span className='text-[10px] font-bold text-red-500 uppercase tracking-wider'>Expired</span>
              ) : timeLeft ? (
                <span className='text-[10px] font-bold text-amber-500 uppercase tracking-wider'>{timeLeft}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <h2 className='text-lg font-bold text-gray-900 line-clamp-2 mb-6 min-h-[56px] leading-tight'>
        {scholarship.name}
      </h2>

      <div className='grid grid-cols-1 gap-4 mb-8'>
        {amountDisplay && (
          <div className='flex items-center gap-3'>
            <Banknote className='w-4 h-4 text-gray-400' />
            <div className='flex flex-col'>
              <span className='text-[10px] uppercase text-gray-400 font-bold tracking-tight'>Value</span>
              <span className='text-sm font-semibold text-gray-700'>{amountDisplay}</span>
            </div>
          </div>
        )}

        {deadlineDisplay && (
          <div className='flex items-center gap-3'>
            <Calendar className='w-4 h-4 text-gray-400' />
            <div className='flex flex-col'>
              <span className='text-[10px] uppercase text-gray-400 font-bold tracking-tight'>Deadline</span>
              <span className={`text-sm font-semibold ${isExpired ? 'text-red-400' : 'text-gray-700'}`}>
                {deadlineDisplay}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className='mt-auto pt-6 border-t border-gray-50 flex items-center justify-between'>
        <Link
          href={`/scholarship/${scholarship.slugs || scholarship.id}`}
          className='text-sm font-bold text-gray-400 hover:text-[#0A6FA7] transition-colors flex items-center gap-1.5'
        >
          View Details
          <ArrowRight className='w-4 h-4' />
        </Link>
        {!isExpired && (
          <Link
            href={`/scholarship/apply/${scholarship.slugs || scholarship.id}`}
            className='px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0A6FA7] hover:bg-[#085a86] transition-all duration-300 shadow-md hover:shadow-lg shadow-[#0A6FA7]/10'
          >
            Apply Now
          </Link>
        )}
      </div>
    </article>
  )
}

export default ScholarshipCard
