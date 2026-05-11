import React from 'react'
import { FaPhoneAlt, FaBriefcase } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'

const MemberSection = ({ university }) => {
  const members = Array.isArray(university?.members)
    ? university.members.filter(
        ({ name, role, phone, email }) =>
          name?.trim() || role?.trim() || phone?.trim() || email?.trim()
      )
    : []

  if (members.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-6 bg-pink-500 rounded-full' />
        <h2 className='text-xl font-bold text-gray-900'>University Leadership</h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {members.map((member, idx) => (
          <div
            key={member.id || idx}
            className='group bg-gray-50/50 rounded-2xl p-6 border border-transparent hover:border-pink-100 hover:bg-white hover:shadow-xl transition-all duration-300'
          >
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-base group-hover:scale-105 transition'>
                <FaBriefcase size={22} />
              </div>
              <div className='min-w-0'>
                <h3 className='font-bold text-gray-900 text-base truncate'>
                  {member?.salutation && `${member.salutation}. `}{member?.name || 'Member'}
                </h3>
                {member?.role && (
                  <span className='inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-pink-100/50 text-pink-600 font-bold uppercase tracking-wider'>
                    {member.role}
                  </span>
                )}
              </div>
            </div>

            <div className='space-y-2 text-sm text-gray-600'>
              {member?.phone && (
                <div className='flex items-center gap-2'>
                  <FaPhoneAlt className='text-pink-400 w-3.5 h-3.5' />
                  <a href={`tel:${member.phone}`} className='hover:text-[#0A6FA7] transition-colors'>
                    {member.phone}
                  </a>
                </div>
              )}
              {member?.email && (
                <div className='flex items-center gap-2'>
                  <MdEmail className='text-pink-400 w-4 h-4' />
                  <a href={`mailto:${member.email}`} className='hover:text-[#0A6FA7] transition-colors break-all'>
                    {member.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemberSection
