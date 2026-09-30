'use client'

import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/ui/shadcn/dialog'
import { formatDate } from '@/utils/date.util'
import {
  BadgeCheck,
  Calendar,
  Clock,
  CreditCard,
  Crown,
  Gem,
  Mail,
  Phone,
  Shield,
  Star,
  User,
  Wallet
} from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'

const MEMBERSHIP_META = {
  PLUS2: { icon: Shield, label: '+2 / Grade 12', color: 'text-gray-600', bg: 'bg-gray-100' },
  BACHELORS: { icon: Crown, label: "Bachelor's", color: 'text-[#387cae]', bg: 'bg-[#387cae]/10' },
  GRADUATE: { icon: Gem, label: 'Graduate', color: 'text-purple-600', bg: 'bg-purple-50' }
}

const parseTrainings = (raw) => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[status] || styles.PENDING}`}
    >
      {status}
    </span>
  )
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className='flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0'>
    <span className='w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center shrink-0'>
      <Icon size={15} className='text-gray-400' />
    </span>
    <div className='min-w-0'>
      <p className='text-[11px] font-bold uppercase tracking-wider text-gray-400'>
        {label}
      </p>
      <p className='text-sm text-gray-800 font-medium break-words'>{value || '—'}</p>
    </div>
  </div>
)

const SectionTitle = ({ children }) => (
  <p className='text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2'>
    {children}
  </p>
)

const MembershipViewModal = ({ isOpen, onClose, membership }) => {
  if (!membership) return null

  const meta = MEMBERSHIP_META[membership.membership_type] || MEMBERSHIP_META.PLUS2
  const Icon = meta.icon
  const student = membership.student

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className='max-w-2xl'>
      <DialogHeader className='bg-white border-b border-gray-100 p-6'>
        <DialogTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
          <BadgeCheck className='text-[#387cae]' size={22} />
          Membership Application
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent className='p-0 bg-gray-50/50 overflow-y-auto max-h-[85vh] rounded-2xl border-none shadow-2xl'>
        <div className='p-6 space-y-6'>
          {/* Header card */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
              <div className='flex items-center gap-3'>
                <span
                  className={`w-12 h-12 rounded-xl ${meta.bg} flex items-center justify-center`}
                >
                  <Icon size={24} className={meta.color} />
                </span>
                <div>
                  <p className='font-bold text-gray-900'>
                    {meta.label} Membership
                  </p>
                  <p className='text-xs text-gray-400'>
                    Application #{membership.id}
                    {membership.reference_id && (
                      <span className='ml-2 font-mono font-semibold text-[#387cae]'>
                        {membership.reference_id}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <StatusBadge status={membership.status} />
            </div>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1'>
                  Type
                </p>
                <p className='font-semibold text-gray-800'>{meta.label}</p>
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1'>
                  Applied
                </p>
                <p className='font-semibold text-gray-800 text-sm'>
                  {membership.createdAt ? formatDate(membership.createdAt) : '—'}
                </p>
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1'>
                  Status
                </p>
                <p className='font-semibold text-gray-800'>{membership.status}</p>
              </div>
            </div>
          </div>

          {/* Student info */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <SectionTitle>Student Information</SectionTitle>
            <InfoRow
              icon={User}
              label='Full Name'
              value={membership.student_name || (student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : '')}
            />
            <InfoRow
              icon={Mail}
              label='Email'
              value={membership.student_email || student?.email}
            />
            <InfoRow
              icon={Phone}
              label='Phone'
              value={membership.student_phone_no || student?.phoneNo}
            />
            {student && (
              <InfoRow
                icon={Star}
                label='Education Level'
                value={student.educationLevel || '—'}
              />
            )}
            {student && (
              <InfoRow
                icon={CheckCircle2}
                label='Future Plan'
                value={student.furtherEducationPlan || '—'}
              />
            )}
            <InfoRow
              icon={Clock}
              label='Submitted At'
              value={membership.createdAt ? formatDate(membership.createdAt) : '—'}
            />
          </div>

          {/* Application details */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <SectionTitle>Application Details</SectionTitle>
            <InfoRow
              icon={Star}
              label='Career Field'
              value={
                membership.career_field === 'unsure'
                  ? 'Deciding later'
                  : membership.career_field
                    ? membership.career_field.charAt(0).toUpperCase() +
                      membership.career_field.slice(1)
                    : '—'
              }
            />
            <div className='py-2.5 border-b border-gray-50 last:border-0'>
              <p className='text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5'>
                Selected Trainings
              </p>
              {parseTrainings(membership.selected_trainings).length > 0 ? (
                <ul className='space-y-1.5'>
                  {parseTrainings(membership.selected_trainings).map((t) => (
                    <li
                      key={t}
                      className='inline-flex mr-1.5 mb-1 items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs text-gray-700'
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-gray-800 font-medium'>—</p>
              )}
            </div>
            <InfoRow
              icon={BadgeCheck}
              label='Institution'
              value={membership.institution}
            />
            <InfoRow
              icon={Wallet}
              label='Membership Fee'
              value={membership.membership_fee}
            />
            <InfoRow
              icon={CreditCard}
              label='Payment Method'
              value={
                membership.payment_method
                  ? (membership.payment_method.charAt(0).toUpperCase() +
                    membership.payment_method.slice(1))
                  : '—'
              }
            />
          </div>

          {/* Dates */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <SectionTitle>Membership Dates</SectionTitle>
            <div className='grid grid-cols-2 gap-4'>
              <InfoRow
                icon={Calendar}
                label='Start Date'
                value={membership.start_date ? formatDate(membership.start_date) : '—'}
              />
              <InfoRow
                icon={Calendar}
                label='End Date'
                value={membership.end_date ? formatDate(membership.end_date) : '—'}
              />
            </div>
            <InfoRow
              icon={BadgeCheck}
              label='Remarks'
              value={membership.remarks || '—'}
            />
          </div>

          {/* Payment proof */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
            <SectionTitle>Payment Proof</SectionTitle>
            {membership.payment_proof_url ? (
              <a
                href={membership.payment_proof_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-sm font-semibold text-[#387cae] hover:underline'
              >
                <CheckCircle2 size={16} />
                View uploaded proof
              </a>
            ) : (
              <p className='text-sm text-gray-400'>No payment proof uploaded.</p>
            )}
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='px-6 border-gray-200 text-gray-600 hover:bg-gray-50'
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MembershipViewModal