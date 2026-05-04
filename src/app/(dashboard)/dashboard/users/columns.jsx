import { Edit2, Trash2, Eye } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'
import { formatRelativeWithTitle } from '@/utils/date.util'
import { useState } from 'react'
import { Dialog, DialogContent, DialogClose } from '@/ui/shadcn/dialog'

const UserAvatar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const imageUrl = user.profileImageUrl || user.profile_image_url || user.image

  if (!imageUrl) {
    const initial = (user.firstName || user.first_name || 'U')
      .charAt(0)
      .toUpperCase()
    return (
      <div className='w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 shadow-sm border border-indigo-200'>
        {initial}
      </div>
    )
  }

  return (
    <>
      <img
        src={imageUrl}
        alt='Profile'
        onClick={() => setIsOpen(true)}
        className='w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition shrink-0 shadow-sm border border-gray-200 bg-white'
        title='View Photo'
      />
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogContent className='max-w-lg p-0 bg-transparent border-none shadow-none flex justify-center items-center relative'>
          <div className='relative'>
            <img
              src={imageUrl}
              alt='Profile Full'
              className='max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain bg-white'
            />
            <Button
              variant='secondary'
              size='icon'
              onClick={() => setIsOpen(false)}
              className='absolute -top-3 -right-3 rounded-full shadow-lg'
            >
              x
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const createColumns = ({ handleEdit, handleDelete, handleView }) => [
  {
    header: 'Full Name',
    accessorKey: 'fullName',
    cell: ({ row }) => {
      const firstName = row.original.firstName || ''
      const lastName = row.original.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim() || 'N/A'
      let roles = row.original.roles || {}
      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles)
        } catch (e) {
          roles = {}
        }
      }
      const activeRoles = Object.entries(roles)
        .filter(([_, value]) => value)
        .map(([role]) => role)

      return (
        <div className='flex items-center gap-3'>
          <UserAvatar user={row.original} />
          <div className='flex flex-col gap-0.5'>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-gray-900'>{fullName}</span>
              {activeRoles.length > 0 && (
                <div className='flex gap-1 flex-wrap'>
                  {activeRoles.map((role) => (
                    <span
                      key={role}
                      className='px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-blue-50 text-blue-700 border border-blue-100'
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className='text-xs text-gray-500'>
              {row.original.email || 'N/A'}
            </span>
          </div>
        </div>
      )
    }
  },
  {
    header: 'Phone Number',
    accessorKey: 'phoneNo',
    cell: ({ getValue }) => (
      <span className='text-gray-600 text-sm'>{getValue() || 'N/A'}</span>
    )
  },
  {
    header: 'Joined Date',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const { label, title } = formatRelativeWithTitle(getValue())
      return (
        <span className='text-gray-500 text-sm cursor-default' title={title}>
          {label}
        </span>
      )
    }
  },
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row }) => {
      let isStudent = false
      let roles = row.original.roles || {}
      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles)
        } catch (e) {
          roles = {}
        }
      }
      if (roles.student === true) {
        isStudent = true
      }

      return (
        <div className='flex gap-1'>
          {isStudent && handleView && (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleView(row.original)}
              className='hover:bg-blue-50 text-blue-600'
              title='View Details'
            >
              <Eye className='w-4 h-4' />
            </Button>
          )}
          {!roles.consultancy && !roles.institution && (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleEdit(row.original)}
              className='hover:bg-amber-50 text-amber-600'
              title='Edit'
            >
              <Edit2 className='w-4 h-4' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleDelete(row.original.id)}
            className='hover:bg-red-50 text-red-600'
            title='Delete'
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      )
    }
  }
]
