'use client'

import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Select } from '@/ui/shadcn/select'
import { Textarea } from '@/ui/shadcn/textarea'
import { Crown, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'PENDING', label: 'Pending' }
]

const formatInputDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch (e) {
    return ''
  }
}

const MembershipApproveModal = ({
  isOpen,
  onClose,
  membership,
  onSave,
  submitting = false
}) => {
  const [status, setStatus] = useState('APPROVED')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && membership) {
      setStatus(membership.status || 'APPROVED')
      setStartDate(formatInputDate(membership.start_date))
      setEndDate(formatInputDate(membership.end_date))
      setRemarks(membership.remarks || '')
      setErrors({})
    }
  }, [isOpen, membership])

  const handleSubmit = async () => {
    const newErrors = {}

    if (status === 'APPROVED' && !endDate) {
      newErrors.endDate = 'End date is required for approval'
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be before start date'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSave({
      status,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      remarks: remarks || null
    })
  }

  const studentName =
    membership?.student_name ||
    (membership?.student
      ? `${membership?.student?.firstName || ''} ${membership?.student?.lastName || ''}`.trim()
      : '')

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className='max-w-md'>
      <DialogHeader className='bg-white border-b border-gray-100 p-6'>
        <DialogTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
          <Crown className='text-[#387cae]' size={22} />
          Update Membership Status
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent className='p-6 space-y-5'>
        {membership && (
          <div className='bg-gray-50 border border-gray-100 rounded-xl p-4'>
            <p className='text-sm font-bold text-gray-800'>{studentName || 'Unknown Student'}</p>
            <p className='text-xs text-gray-500'>
              {membership.student_email || membership.student?.email || 'No email'}
            </p>
            <div className='flex items-center justify-between mt-3'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                {membership.membership_type} · #{membership.id}
              </span>
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-yellow-50 text-yellow-700 border-yellow-200'>
                {membership.status}
              </span>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <Label required>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {status === 'APPROVED' && (
          <div className='bg-green-50/50 border border-green-100 rounded-xl p-4 space-y-4 animate-in fade-in duration-200'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input
                  id='startDate'
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {!startDate && (
                  <p className='text-[10px] text-gray-400'>
                    Leave empty to start today
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endDate' required>
                  End Date
                </Label>
                <Input
                  id='endDate'
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className='text-xs text-red-500'>{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <Label htmlFor='remarks'>Remarks</Label>
          <Textarea
            id='remarks'
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder='Notes visible to the student (e.g. duration, next steps)...'
            className='min-h-[80px] resize-none'
          />
        </div>
      </DialogContent>

      <DialogFooter className='px-6 pb-6'>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={submitting}
          className='border-gray-200 text-gray-600 hover:bg-gray-50'
        >
          Cancel
        </Button>
        <Button
          type='button'
          onClick={handleSubmit}
          disabled={submitting}
          className='bg-[#387cae] hover:bg-[#2d658e] text-white min-w-[130px]'
        >
          {submitting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : (
            'Save Status'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default MembershipApproveModal