'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  GraduationCap,
  Clock,
  DollarSign,
  Building2,
  FileText,
  Target,
  ListOrdered,
  ChevronLeft,
  ArrowRight,
  Info
} from 'lucide-react'

import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import EmptyState from '@/ui/shadcn/EmptyState'
import HTMLRenderer from '@/ui/HTMLRenderer'
import ShareSection from '@/ui/organisms/common/ShareSection'

const ProgramContent = ({ program, error }) => {
  if (error || !program) {
    return (
      <>
        <Header />
        <Navbar />
        <div className='container mx-auto px-4 py-20'>
          <EmptyState
            icon={BookOpen}
            title='Program Not Found'
            description={error || "The program you're looking for doesn't exist or was moved."}
            action={{
              label: 'Browse Programs',
              onClick: () => (window.location.href = '/programs')
            }}
          />
        </div>
        <Footer />
      </>
    )
  }

  const groupedSyllabus = program?.syllabus?.reduce((acc, item) => {
    const year = item.year
    const semester = item.semester
    if (!acc[year]) acc[year] = {}
    if (semester === 0) {
      if (!acc[year].yearly) acc[year].yearly = []
      acc[year].yearly.push(item)
    } else {
      if (!acc[year][semester]) acc[year][semester] = []
      acc[year][semester].push(item)
    }
    return acc
  }, {})

  return (
    <>
      <Header />
      <Navbar />

      <main className='bg-white min-h-screen pb-20'>
        <section className='relative w-full bg-[#0A6FA7]/5 border-b border-[#0A6FA7]/10 overflow-hidden'>
          <div className='absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#0A6FA7]/10 to-transparent pointer-events-none' />
          <div className='container mx-auto px-4 py-16 md:py-24 relative z-10'>
            <div className='max-w-4xl'>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-2 mb-8' >
                <Link href='/programs' className='group flex items-center gap-2 text-sm font-bold text-[#0A6FA7] hover:text-[#085e8a] transition-all bg-white px-4 py-2 rounded-full shadow-sm border border-[#0A6FA7]/10' >
                  <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                  Back to Programs
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} >
                <div className='flex flex-wrap items-center gap-3 mb-6'>
                  {program.code && (
                    <span className='px-3 py-1 bg-[#0A6FA7] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-[#0A6FA7]/20'> {program.code} </span>
                  )}
                  {program.programdegree?.title && (
                    <span className='bg-white px-3 py-1 rounded-md text-[#0A6FA7] text-xs font-bold border border-[#0A6FA7]/10 shadow-sm'> {program.programdegree.short_name || program.programdegree.title} </span>
                  )}
                  {program.programlevel?.title && (
                    <span className='text-gray-400 text-xs font-medium bg-gray-100/50 px-2 py-1 rounded'> {program.programlevel.title} </span>
                  )}
                </div>

                <h1 className='text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight'> {program.title} </h1>

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
                  {[
                    { icon: Clock, label: 'Duration', value: program.duration },
                    { icon: GraduationCap, label: 'Mode', value: program.delivery_mode },
                    { icon: Building2, label: 'Delivery', value: program.delivery_type },
                    { icon: FileText, label: 'Credits', value: program.credits }
                  ].map((stat, idx) => stat.value && (
                    <div key={idx} className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2 text-gray-400'>
                        <stat.icon className='w-4 h-4 text-[#0A6FA7]' />
                        <span className='text-[10px] font-bold uppercase tracking-widest'>{stat.label}</span>
                      </div>
                      <p className='text-gray-900 font-bold'>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className='container mx-auto px-4 py-16'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-16'>
            <div className='lg:col-span-2 space-y-16'>
              {[
                { id: 'outcomes', icon: Target, title: 'Learning outcomes', content: program.learning_outcomes },
                { id: 'eligibility', icon: Info, title: 'Eligibility criteria', content: program.eligibility_criteria },
                { id: 'curriculum', icon: ListOrdered, title: 'Curriculum overview', content: program.curriculum },
                { id: 'fee', icon: DollarSign, title: 'Fee structure', content: program.fee }
              ].map((section) => section.content && (
                <motion.section key={section.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='bg-white' >
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='w-12 h-12 rounded-2xl bg-[#0A6FA7]/5 flex items-center justify-center text-[#0A6FA7]'>
                      <section.icon className='w-6 h-6' />
                    </div>
                    <h2 className='text-2xl font-black text-gray-900 tracking-tight'>{section.title}</h2>
                  </div>
                  <HTMLRenderer html={section.content} />
                </motion.section>
              ))}

              {groupedSyllabus && Object.keys(groupedSyllabus).length > 0 && (
                <section className='bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100'>
                  <div className='flex items-center gap-3 mb-10'>
                    <div className='w-12 h-12 rounded-2xl bg-[#0A6FA7] flex items-center justify-center text-white shadow-lg shadow-[#0A6FA7]/20'>
                      <GraduationCap className='w-6 h-6' />
                    </div>
                    <h2 className='text-2xl font-black text-gray-900 tracking-tight'>Syllabus structure</h2>
                  </div>

                  <div className='space-y-12'>
                    {Object.entries(groupedSyllabus)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([year, semesters]) => (
                        <div key={year} className='relative pl-8 border-l-2 border-[#0A6FA7]/10 pb-4 last:pb-0'>
                          <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0A6FA7] border-4 border-white shadow-sm' />
                          <h3 className='text-xl font-black text-[#0A6FA7] mb-8'> Year {year} </h3>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            {semesters.yearly && (
                              <div className='col-span-full'>
                                <div className='space-y-3'>
                                  {semesters.yearly.map((item) => (
                                    <div key={item.id} className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-[#0A6FA7]/30 transition-all'>
                                      <span className='font-bold text-gray-800'>{item.programCourse?.title ?? '—'}</span>
                                      {item.is_elective && <span className='text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded font-bold uppercase tracking-wider'>Elective</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Object.entries(semesters)
                              .filter(([k]) => k !== 'yearly')
                              .sort(([a], [b]) => Number(a) - Number(b))
                              .map(([semester, items]) => (
                                <div key={semester} className='space-y-4'>
                                  <h4 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1'> Semester {semester} </h4>
                                  <div className='space-y-2'>
                                    {items.map((item) => (
                                      <div key={item.id} className='flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0A6FA7]/20 transition-all group' >
                                        <span className='font-bold text-gray-700 group-hover:text-gray-900 transition-colors'> {item.programCourse?.title ?? '—'} </span>
                                        {item.is_elective && ( <span className='text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black uppercase'> Elective </span> )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>

            <div className='space-y-8'>
              <div className='sticky top-24 space-y-8'>
                {program.colleges && program.colleges.length > 0 && (
                  <div className='bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(3,105,161,0.08)] transition-all duration-500'>
                    <div className='flex items-center gap-3 mb-8'>
                      <div className='w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600'>
                        <Building2 className='w-5 h-5' />
                      </div>
                      <h3 className='text-xl font-black text-gray-900 tracking-tight'>Associated Colleges</h3>
                    </div>
                    <div className='space-y-3'>
                      {program.colleges.map((college) => (
                        <div key={college.id} className='group'>
                          {college.slugs ? (
                            <Link href={`/colleges/${encodeURIComponent(college.slugs)}`} className='flex items-center justify-between py-3 px-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-[#0A6FA7] hover:shadow-xl hover:shadow-[#0A6FA7]/5 transition-all text-gray-800' >
                              <span className='font-bold text-sm line-clamp-1 group-hover:text-[#0A6FA7] transition-colors'>{college.name}</span>
                              <ArrowRight className='w-4 h-4 text-[#0A6FA7] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
                            </Link>
                          ) : (
                            <div className='py-3 px-4 rounded-xl border border-gray-50 bg-gray-50/50 text-gray-800 font-bold text-sm'> {college.name} </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ShareSection title={program.title} type='program' />
      <Footer />
    </>
  )
}

export default ProgramContent
