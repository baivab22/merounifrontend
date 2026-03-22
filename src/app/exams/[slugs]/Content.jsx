'use client'

import he from 'he'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import {
  ClipboardCheck,
  Building2,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  BadgeCheck,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { formatDate } from '@/utils/date.util'

const InfoRow = ({ label, value }) =>
  value ? (
    <div className='flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0'>
      <span className='text-sm text-gray-500 font-medium'>{label}</span>
      <span className='text-sm font-bold text-gray-800 text-right max-w-[60%]'>{value}</span>
    </div>
  ) : null

const SectionCard = ({ icon: Icon, title, children, accent = '#0A6FA7' }) => (
  <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
    <div className='flex items-center gap-3 px-6 py-4 border-b border-gray-100'>
      <div className='p-2 rounded-lg' style={{ backgroundColor: `${accent}15` }}>
        <Icon className='w-4 h-4' style={{ color: accent }} />
      </div>
      <h2 className='text-base font-bold text-gray-800'>{title}</h2>
    </div>
    <div className='px-6 py-4'>{children}</div>
  </div>
)

export default function ExamDetailContent({ exam }) {
  const decodedContent = exam?.description ? he.decode(exam.description) : ''

  return (
    <div className='min-h-screen bg-gray-50/60 py-10 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-5xl mx-auto'>

        {/* Back Button */}
        <div className='mb-8'>
          <Link
            href='/exams'
            className='group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0A6FA7] transition-all'
          >
            <div className='p-1.5 rounded-full bg-gray-100 group-hover:bg-[#0A6FA7] group-hover:text-white transition-all'>
              <FaArrowLeft className='w-3 h-3' />
            </div>
            <span>Back to Exams</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6'>
          <div className='flex items-start gap-4 mb-6'>
            <div className='p-3.5 bg-blue-50 rounded-xl shrink-0'>
              <ClipboardCheck className='w-6 h-6 text-[#0A6FA7]' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap gap-2 mb-2'>
                {exam.level?.title && (
                  <span className='px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider'>
                    {exam.level.title}
                  </span>
                )}
                {exam.exam_details?.[0]?.exam_type && (
                  <span className='px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider'>
                    {exam.exam_details[0].exam_type}
                  </span>
                )}
                {exam.category?.title && (
                  <span className='px-2.5 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-[#0A6FA7] uppercase tracking-wider'>
                    {exam.category.title}
                  </span>
                )}
              </div>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight'>
                {exam.title}
              </h1>
              {exam.examUniversity?.fullname && (
                <p className='flex items-center gap-1.5 text-sm text-gray-500 font-medium mt-2'>
                  <Building2 className='w-4 h-4 text-gray-400 shrink-0' />
                  {exam.examUniversity.fullname}
                </p>
              )}
            </div>
          </div>

          {/* Key Dates Strip */}
          {exam.application_details?.length > 0 && (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2'>
              {[
                { label: 'Application Opens', value: formatDate(exam.application_details[0].opening_date), icon: CalendarDays, color: '#10b981' },
                { label: 'Application Closes', value: formatDate(exam.application_details[0].closing_date), icon: CalendarDays, color: '#ef4444' },
                { label: 'Exam Date', value: formatDate(exam.application_details[0].exam_date), icon: BookOpen, color: '#0A6FA7' },
                { label: 'Normal Fee', value: exam.application_details[0].normal_fee ? `Rs. ${exam.application_details[0].normal_fee}` : null, icon: FileText, color: '#f59e0b' },
              ].filter(d => d.value).map(({ label, value, icon: Icon, color }) => (
                <div key={label} className='bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1 border border-gray-100'>
                  <Icon className='w-4 h-4 mb-0.5' style={{ color }} />
                  <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>{label}</span>
                  <span className='text-sm font-bold text-gray-800'>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>

            {/* Description */}
            {decodedContent && (
              <SectionCard icon={FileText} title='About this Exam'>
                <div
                  dangerouslySetInnerHTML={{ __html: decodedContent }}
                  className='text-gray-700 leading-7 prose prose-sm max-w-none
                    [&>iframe]:w-full [&>iframe]:max-w-full [&>iframe]:aspect-video [&>iframe]:h-auto [&>iframe]:rounded-md [&>iframe]:mt-4
                    [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse
                    [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:text-left [&_th]:border [&_th]:border-gray-200
                    [&_td]:p-2 [&_td]:border [&_td]:border-gray-200
                    [&_tr:nth-child(even)]:bg-gray-50
                    [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3
                    [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1'
                />
              </SectionCard>
            )}

            {/* Exam Details */}
            {exam.exam_details?.length > 0 && (
              <SectionCard icon={Layers} title='Exam Structure'>
                <div className='space-y-4'>
                  {exam.exam_details.map((ed, i) => (
                    <div key={ed.id || i} className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                      {ed.exam_type && (
                        <span className='inline-block mb-3 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full'>
                          {ed.exam_type}
                        </span>
                      )}
                      <div>
                        <InfoRow label='Full Marks' value={ed.full_marks} />
                        <InfoRow label='Pass Marks' value={ed.pass_marks} />
                        <InfoRow label='Number of Questions' value={ed.number_of_question} />
                        <InfoRow label='Duration' value={ed.duration} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Syllabus */}
            {exam.syllabus && (
              <SectionCard icon={BookOpen} title='Syllabus'>
                <div
                  dangerouslySetInnerHTML={{ __html: he.decode(exam.syllabus) }}
                  className='text-gray-700 leading-relaxed prose prose-sm max-w-none
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
                    [&_h1]:text-lg [&_h1]:font-bold
                    [&_h2]:text-base [&_h2]:font-bold'
                />
              </SectionCard>
            )}

          </div>

          {/* Sidebar */}
          <div className='space-y-6'>

            {/* Application Details */}
            {exam.application_details?.length > 0 && (
              <SectionCard icon={CalendarDays} title='Application Info'>
                {exam.application_details.map((ad, i) => (
                  <div key={ad.id || i}>
                    <InfoRow label='Opening Date' value={formatDate(ad.opening_date)} />
                    <InfoRow label='Closing Date' value={formatDate(ad.closing_date)} />
                    <InfoRow label='Exam Date' value={formatDate(ad.exam_date)} />
                    <InfoRow label='Normal Fee' value={ad.normal_fee ? `Rs. ${ad.normal_fee}` : null} />
                    <InfoRow label='Late Fee' value={ad.late_fee ? `Rs. ${ad.late_fee}` : null} />
                  </div>
                ))}
              </SectionCard>
            )}

            {/* Quick Info */}
            <SectionCard icon={BadgeCheck} title='Quick Info'>
              <InfoRow label='Level' value={exam.level?.title} />
              <InfoRow label='Affiliation' value={exam.examUniversity?.fullname} />
              <InfoRow label='Faculty' value={exam.faculty?.title} />
              <InfoRow label='Category' value={exam.category?.title} />
              <InfoRow
                label='Posted'
                value={exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : null}
              />
            </SectionCard>

            {/* Past Question CTA */}
            {exam.pastQuestion && (
              <a
                href={exam.pastQuestion}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#0A6FA7] hover:bg-[#085e8a] text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#0A6FA7]/20 hover:scale-[1.01] active:scale-95'
              >
                <HelpCircle className='w-4 h-4' />
                View Past Questions
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
