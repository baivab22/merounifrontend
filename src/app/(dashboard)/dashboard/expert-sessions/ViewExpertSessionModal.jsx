'use client'

import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Phone, GraduationCap, User, CalendarDays } from 'lucide-react'
import { formatDate } from '@/utils/date.util'

export default function ViewExpertSessionModal({ isOpen, onClose, session }) {
    if (!session) return null

    const getStatusColor = (currentStatus) => {
        switch (currentStatus) {
            case 'new':
                return 'bg-blue-100 text-blue-800'
            case 'in_progress':
                return 'bg-amber-100 text-amber-900'
            case 'resolved':
                return 'bg-emerald-100 text-emerald-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const status = session.status || 'new'

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-xl"
        >
            <DialogHeader>
                <DialogTitle>Expert Session Details</DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>
            <DialogContent>
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0A6FA7]/10 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-[#0A6FA7]" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
                                <p className="text-base font-medium text-gray-900">{session.fullname || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#30AD8F]/10 flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-[#30AD8F]" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</label>
                                <p className="text-base font-medium text-gray-900">{session.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 col-span-1 sm:col-span-2">
                            <div className="w-10 h-10 rounded-lg bg-[#387cae]/10 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5 text-[#387cae]" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Desired Course</label>
                                <p className="text-base font-medium text-gray-900">{session.desired_course || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 col-span-1 sm:col-span-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <CalendarDays className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Requested On</label>
                                <p className="text-base font-medium text-gray-900">{session.createdAt ? formatDate(session.createdAt) : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Display */}
                    <div className="flex items-center justify-start">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mr-3">Current Status:</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)}`}>
                                {status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={onClose} variant="outline">Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
