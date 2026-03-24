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

export default function ExamDetailContent({ exam: initialExam }) {
  // Flattening similar to dashboard logic to handle data consistently
  const examDetail = initialExam.exam_details?.[0] || {}
  const appDetail = initialExam.application_details?.[0] || {}

  const exam = {
    ...initialExam,
    exam_type: initialExam.exam_type || examDetail.exam_type || 'Written',
    question_type: initialExam.question_type || examDetail.question_type || 'MCQ',
    duration: initialExam.duration || examDetail.duration || '',
    full_marks: initialExam.full_marks || examDetail.full_marks || '',
    pass_marks: initialExam.pass_marks || examDetail.pass_marks || '',
    questions_count: initialExam.questions_count || initialExam.number_of_question || examDetail.number_of_question || '',
    normal_fee: initialExam.normal_fee || appDetail.normal_fee || '',
    late_fee: initialExam.late_fee || appDetail.late_fee || '',
    opening_date: initialExam.opening_date || appDetail.opening_date || null,
    closing_date: initialExam.closing_date || appDetail.closing_date || null,
    exam_date: initialExam.exam_date || appDetail.exam_date || null
  }

  const decodedContent = exam?.description ? he.decode(exam.description) : ''
  const affiliations = exam.affiliation || exam.universities || (exam.university ? [exam.university] : [])
  const pastQuestions = (Array.isArray(exam.pastQuestion) ? exam.pastQuestion : (typeof exam.pastQuestion === 'string' ? exam.pastQuestion.split(',') : [])).filter(Boolean)

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
                {exam.exam_type && (
                  <span className='px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider'>
                    {exam.exam_type}
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
              {affiliations.length > 0 && (
                <div className='flex items-center flex-wrap gap-2 mt-2'>
                  <Building2 className='w-4 h-4 text-gray-400 shrink-0' />
                  {affiliations.map((uni, idx) => (
                    <span key={idx} className='text-sm text-gray-500 font-medium'>
                      {typeof uni === 'object' ? (uni.fullname || uni.name) : uni}
                      {idx < affiliations.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Key Dates Strip */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2'>
            {[
              { label: 'Application Opens', value: formatDate(exam.opening_date), icon: CalendarDays, color: '#10b981' },
              { label: 'Application Closes', value: formatDate(exam.closing_date), icon: CalendarDays, color: '#ef4444' },
              { label: 'Exam Date', value: formatDate(exam.exam_date), icon: BookOpen, color: '#0A6FA7' },
              { label: 'Normal Fee', value: exam.normal_fee ? `Rs. ${exam.normal_fee}` : null, icon: FileText, color: '#f59e0b' },
            ].filter(d => d.value).map(({ label, value, icon: Icon, color }) => (
              <div key={label} className='bg-gray-50 rounded-xl p-3.5 flex flex-col gap-1 border border-gray-100'>
                <Icon className='w-4 h-4 mb-0.5' style={{ color }} />
                <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>{label}</span>
                <span className='text-sm font-bold text-gray-800'>{value}</span>
              </div>
            ))}
            {/* Fallback if no dates are available yet */}
            {![exam.opening_date, exam.closing_date, exam.exam_date].some(Boolean) && (
              <div className='col-span-full py-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium'>
                Important dates and fees to be announced.
              </div>
            )}
          </div>
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

            {/* Exam Structure */}
            {(exam.full_marks || exam.pass_marks || exam.duration || exam.questions_count) && (
              <SectionCard icon={Layers} title='Exam Structure'>
                <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
                  {exam.exam_type && (
                    <span className='inline-block mb-3 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full'>
                      {exam.exam_type} mode
                    </span>
                  )}
                  <div>
                    <InfoRow label='Full Marks' value={exam.full_marks} />
                    <InfoRow label='Pass Marks' value={exam.pass_marks} />
                    <InfoRow label='Number of Questions' value={exam.questions_count} />
                    <InfoRow label='Question Type' value={exam.question_type} />
                    <InfoRow label='Duration' value={exam.duration} />
                  </div>
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

            {/* Quick Info */}
            <SectionCard icon={BadgeCheck} title='Quick Info'>
              <InfoRow label='Level' value={exam.level?.title} />
              {affiliations.length > 0 && (
                <InfoRow 
                  label='Affiliation' 
                  value={affiliations.map(u => typeof u === 'object' ? (u.fullname || u.name) : u).join(', ')} 
                />
              )}
              {exam.conducted_by && <InfoRow label='Conducted By' value={exam.conducted_by} />}
              <InfoRow label='Faculty' value={exam.faculty?.title} />
              <InfoRow label='Category' value={exam.category?.title} />
              <InfoRow
                label='Posted'
                value={exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : null}
              />
            </SectionCard>

            {/* Application Fees */}
            {(exam.normal_fee || exam.late_fee) && (
              <SectionCard icon={CalendarDays} title='Registration Fees'>
                <InfoRow label='Normal Fee' value={exam.normal_fee ? `Rs. ${exam.normal_fee}` : null} />
                <InfoRow label='Late Fee' value={exam.late_fee ? `Rs. ${exam.late_fee}` : null} />
              </SectionCard>
            )}

            {/* Past Question Documents */}
            {pastQuestions.length > 0 && (
              <SectionCard icon={HelpCircle} title='Past Questions'>
                <div className="space-y-3">
                  {pastQuestions.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#0A6FA7]/30 text-gray-700 hover:text-[#0A6FA7] text-sm font-bold rounded-xl transition-all hover:shadow-md'
                    >
                      <div className='w-8 h-8 rounded-lg bg-[#0A6FA7]/10 flex items-center justify-center text-[#0A6FA7] text-[10px]'>
                         {link.toLowerCase().includes('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <span className='flex-1 truncate'>Document {idx + 1}</span>
                      <HelpCircle className='w-4 h-4 opacity-50' />
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

