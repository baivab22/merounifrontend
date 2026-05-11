'use client'

import Link from 'next/link'
import { Clock, GraduationCap, Building2 } from 'lucide-react'

const ProgramCard = ({ program }) => {
    const slug = program.slug || program.slug
    const universityNames = program.universities?.map(u => u.short_name || u.fullname).join(', ')

    const universitySlug = program.universities?.[0]?.slug || program.universities?.[0]?.slug
    const detailHref = universitySlug ? `/${universitySlug}/programs/${slug}` : `/programs/${slug}`

    return (
        <Link href={detailHref} className='group'>
            <article className='bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col hover:border-[#0A6FA7]/30 hover:shadow-xl hover:shadow-[#0A6FA7]/5 transition-all duration-300 h-full'>
                <div className='aspect-[16/9] w-full bg-gray-50 flex items-center justify-center overflow-hidden relative'>
                    <img
                        src={program.cover_image || program.featured_image || '/images/logo.png'}
                        alt={program.title}
                        className={
                            program.cover_image || program.featured_image
                                ? 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                : 'w-1/2 h-auto object-contain opacity-30 group-hover:scale-110 transition-transform duration-500'
                        }
                    />
                    {program.programlevel?.title && (
                        <div className='absolute top-3 left-3'>
                            <span className='px-2 py-1 bg-white/90 backdrop-blur-sm text-[#0A6FA7] text-[10px] font-bold uppercase tracking-wider rounded border border-[#0A6FA7]/10'>
                                {program.programlevel.title}
                            </span>
                        </div>
                    )}
                </div>

                <div className='p-5 flex flex-col flex-1'>
                    <div className='flex-1'>
                        {program.degrees?.length > 0 && (
                            <p className='text-[10px] font-bold text-[#0A6FA7] uppercase tracking-widest mb-2 opacity-80'>
                                {program.degrees.map((d) => d.short_name || d.title).join(' · ')}
                            </p>
                        )}
                        <h2 className='text-lg font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#0A6FA7] transition-colors'>
                            {program.title}
                        </h2>

                        <div className='space-y-2 mb-5'>
                            {universityNames && (
                                <div className='flex items-center gap-2 text-gray-500 text-sm'>
                                    <Building2 className='w-4 h-4 text-[#0A6FA7]' />
                                    <span className='line-clamp-1'>{universityNames}</span>
                                </div>
                            )}
                            {program.duration && (
                                <div className='flex items-center gap-2 text-gray-500 text-sm'>
                                    <Clock className='w-4 h-4 text-[#0A6FA7]' />
                                    <span>{program.duration}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='pt-4 border-t border-gray-50 mt-auto'>
                        <div className='flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-bold text-[#0A6FA7] bg-[#0A6FA7]/5 group-hover:bg-[#0A6FA7] group-hover:text-white transition-all duration-300'>
                            View Details
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default ProgramCard
