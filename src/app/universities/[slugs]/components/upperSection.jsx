import React, { useState } from 'react'
import { MdDateRange } from 'react-icons/md'
import { LiaUniversitySolid } from 'react-icons/lia'
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'
import { IoMdMail } from 'react-icons/io'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import he from 'he'
import MemberSection from './MemberSection'
import VideoSection from './VideoSection'
import LevelSections from './LevelSections'
import ImageGallery from './Gallery'
import MapSection from './MapSection'
const UpperSection = ({ university }) => {
  return (
    <div className='flex flex-col items-center'>
      {/* Top Section (Already Styled) */}

      <div className='w-full relative'>
        <div className='absolute top-6 left-6 md:left-24 z-10'>
          <Link
            href='/universities'
            className='inline-flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-medium transition-all shadow-lg border border-white/20'
          >
            <FaArrowLeft className='w-3 h-3' />
            <span>Back to Universities</span>
          </Link>
        </div>
        <img
          src={
            university?.featured_image !== ''
              ? university?.featured_image
              : '/images/degreeHero.webp'
          }
          alt={university?.fullname || 'University Image'}
          className='h-[25vh] w-full md:h-[400px] object-cover bg-gray-200'
        />
        <div className='flex flex-row lg:h-[95px] bg-[#30AD8F] bg-opacity-5 items-center p-0 px-8 sm:px-14 md:px-24'>
          <div className='flex items-center justify-center rounded-full bg-white -translate-y-8 overflow-hidden w-24 h-24 md:w-32 md:h-32'>
            <img
              src={
                university?.logo ||
                `https://avatar.iran.liara.run/username?username=${university?.fullname}`
              }
              alt='uni logo'
              className='object-cover w-full h-full rounded-full aspect-square'
            />
          </div>
          <div className='ml-4'>
            <h2 className='font-bold text-lg lg:text-4xl lg:leading-[50px]'>
              {university?.fullname || ''}
            </h2>
          </div>
        </div>
      </div>

      {/* Key Facts Section - Re-styled as cards */}
      <div className='px-4 sm:px-8 md:px-12 lg:px-24 w-full mt-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5'>
          {/* Established */}
          <div className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group'>
            <div className='bg-blue-50 p-3 rounded-2xl mb-4 group-hover:bg-[#0A6FA7]/10 transition-colors duration-300'>
              <MdDateRange size={24} className='text-[#0A6FA7]' />
            </div>
            <p className='text-xs uppercase tracking-wider text-gray-500 font-medium mb-1'>
              Established
            </p>
            <p className='text-sm text-gray-700'>
              {university?.date_of_establish ?? 'N/A'}
            </p>
          </div>

          {/* Type */}
          <div className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group'>
            <div className='bg-emerald-50 p-3 rounded-2xl mb-4 group-hover:bg-[#30AD8F]/10 transition-colors duration-300'>
              <LiaUniversitySolid size={26} className='text-[#30AD8F]' />
            </div>
            <p className='text-xs uppercase tracking-wider text-gray-500 font-medium mb-1'>
              Institute Type
            </p>
            <p className='text-sm text-gray-700 whitespace-nowrap'>
              {university?.type_of_institute || 'N/A'}
            </p>
          </div>

          {/* Contact */}
          <div className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group'>
            <div className='bg-orange-50 p-3 rounded-2xl mb-4 group-hover:bg-orange-100 transition-colors duration-300'>
              <FaPhoneAlt size={20} className='text-orange-500' />
            </div>
            <p className='text-xs uppercase tracking-wider text-gray-500 font-medium mb-1'>
              Contact
            </p>
            <a
              href={`tel:${university?.contact?.phone_number || ''}`}
              className='text-sm text-gray-700 hover:text-[#0A6FA7] transition-colors'
            >
              {university?.contact?.phone_number || 'N/A'}
            </a>
          </div>

          {/* Address */}
          <div className='bg-white rounded-2xl shadow-[0_2px_15_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group'>
            <div className='bg-emerald-50 p-3 rounded-2xl mb-4 group-hover:bg-[#30AD8F]/10 transition-colors duration-300'>
              <FaMapMarkerAlt size={20} className='text-[#30AD8F]' />
            </div>
            <p className='text-xs uppercase tracking-wider text-gray-500 font-medium mb-1'>
              Address
            </p>
            <p className='text-sm text-gray-700 line-clamp-2'>
              {[
                university?.street,
                university?.city,
                university?.state,
                university?.country
              ].filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>

          {/* Email */}
          <div className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group sm:col-span-2 lg:col-span-1'>
            <div className='bg-sky-50 p-3 rounded-2xl mb-4 group-hover:bg-sky-100 transition-colors duration-300'>
              <IoMdMail size={22} className='text-sky-500' />
            </div>
            <p className='text-xs uppercase tracking-wider text-gray-500 font-medium mb-1'>
              Email
            </p>
            <a
              href={`mailto:${university?.contact?.email || ''}`}
              className='text-sm text-gray-700 hover:text-[#0A6FA7] transition-colors line-clamp-1 break-all'
            >
              {university?.contact?.email || 'N/A'}
            </a>
          </div>
        </div>
      </div>

      {/* About Section with Map Sidebar */}
      <div className='w-full lg:w-[85%] px-4 sm:px-8 md:px-12 lg:px-24 mb-12 flex flex-col lg:flex-row gap-8 lg:gap-16'>
        {/* Main Content: About */}
        <div className='flex-1'>
          <h2 className='font-bold text-xl md:text-2xl mb-6 flex items-center gap-3'>
            <div className='w-1.5 h-8 bg-[#30AD8F] rounded-full' />
            About {university?.fullname}
          </h2>
          <div
            dangerouslySetInnerHTML={{
              __html: he.decode(university?.description || '')
            }}
            className="leading-7 text-justify space-y-4
            text-xs md:text-sm lg:text-base
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
            [&_ol]:pl-8 [&_ul]:pl-8 [&_li]:pl-2
            [&_table]:min-w-full [&_table]:border-collapse [&_th]:bg-gray-100 [&_th]:p-2 [&_td]:p-2 [&_td]:border
            "
          />
        </div>

        {/* Sidebar: Map Widget */}
        <div className='lg:w-[320px] shrink-0'>
          <MapSection university={university} />
        </div>
      </div>

      {/* college programs */}
      {Array.isArray(university?.programs) &&
        university.programs.length > 0 && (
          <section className="w-full mb-14 max-md:mb-7 px-4 sm:px-8 md:px-12 lg:px-24">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#30AD8F]/10 to-[#30AD8F]/5 p-10 max-md:p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-lg md:text-xl text-gray-900">
                  Programs Offered
                </h2>
                <span className="text-sm font-medium bg-[#30AD8F]/20 text-[#30AD8F] px-4 py-1.5 rounded-full">
                  {university.programs.length} Program{university.programs.length > 1 && "s"}
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {university.programs.map((item, idx) => (
                  <Link
                    key={item.id || idx}
                    href={`/programs/${item?.program?.slugs}`}
                    className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm shadow-emerald-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-[#30AD8F]/10 border border-transparent hover:border-[#30AD8F]/20"
                  >
                    <div className='flex items-center gap-3'>
                      <span className="h-2 w-2 rounded-full bg-[#30AD8F] group-hover:scale-125 transition-transform" />
                      <span className="text-sm md:text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                        {item?.program?.title || "N/A"}
                      </span>
                    </div>
                    <span className='text-[#30AD8F] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-xs uppercase tracking-widest'>View</span>
                  </Link>
                ))}
              </ul>
            </div>
          </section>
        )}

      <LevelSections university={university} />
      <MemberSection university={university} />
      <ImageGallery
        images={university?.gallery}
        universityName={university?.fullname}
      />
      <VideoSection university={university} />
    </div>
  )
}

export default UpperSection