import React from 'react'
import { FaUser, FaPhoneAlt, FaBriefcase } from 'react-icons/fa'

const MemberSection = ({ validMembers }) => {
  if (!validMembers || validMembers.length === 0) {
    return null
  }

  return (
    <div className='bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-8 bg-[#30AD8F] rounded-full' />
        <h2 className='text-2xl font-bold text-gray-900'>Our Team</h2>
      </div>

      <div className='flex overflow-x-auto md:grid md:grid-cols-2 gap-4 md:gap-6 no-scrollbar pb-4 -mx-2 px-2 md:mx-0 md:px-0'>
        {validMembers.map((member, index) => (
          <div
            key={index}
            className='flex-shrink-0 w-[85vw] md:w-auto group bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:border-[#30AD8F]/30 h-auto'
          >
            {/* Member Name */}
            {
              member.image_url ? (
                <div className='flex items-center gap-4 mb-6 pb-4 border-b border-gray-200'>
                  <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 group-hover:bg-[#30AD8F]/10 transition-colors border border-gray-100 shadow-sm'>
                    <img src={member.image_url} alt={member.name} className='w-full h-full object-cover rounded-2xl' width={48} height={48} />
                  </div>
                  {member.name?.trim() && (
                    <h3 className='text-lg font-bold text-gray-900 leading-tight'>
                      {member.name}
                    </h3>
                  )}
                </div>
              ) : (
                <div className='flex items-center gap-4 mb-6 pb-4 border-b border-gray-200'>
                  <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 group-hover:bg-[#30AD8F]/10 transition-colors border border-gray-100 shadow-sm'>
                    <FaUser className='w-5 h-5 text-[#30AD8F]' />
                  </div>
                  {member.name?.trim() && (
                    <h3 className='text-lg font-bold text-gray-900 leading-tight'>
                      {member.name}
                    </h3>
                  )}
                </div>
              )
            }

            <div className='space-y-4'>
              {/* Role */}
              {member.role?.trim() && (
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center mt-0.5 border border-gray-100'>
                    <FaBriefcase className='w-3.5 h-3.5 text-gray-400' />
                  </div>
                  <div>
                    <p className='text-[10px] text-gray-500 uppercase tracking-widest font-bold'>
                      Role
                    </p>
                    <p className='text-sm text-gray-700 font-medium'>
                      {member.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Number */}
              {member.contact_number?.trim() && (
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center mt-0.5 border border-gray-100'>
                    <FaPhoneAlt className='w-3.5 h-3.5 text-[#0A6FA7]' />
                  </div>
                  <div>
                    <p className='text-[10px] text-gray-500 uppercase tracking-widest font-bold'>
                      Contact
                    </p>
                    <a
                      href={`tel:${member.contact_number}`}
                      className='text-sm text-[#0A6FA7] font-semibold hover:underline transition-all'
                    >
                      {member.contact_number}
                    </a>
                  </div>
                </div>
              )}

              {/* Description */}
              {member.description?.trim() && (
                <div className='pt-4 mt-2 border-t border-gray-100'>
                  <p className='text-sm text-gray-500 leading-relaxed italic opacity-80'>
                    "{member.description}"
                  </p>
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
