import { formatRelativeWithTitle } from '@/utils/date.util'

export const createColumns = () => [
  {
    header: 'Timestamp',
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
    header: 'User',
    accessorKey: 'user',
    cell: ({ row }) => {
      const user = row.original.user
      if (!user) return <span className='text-gray-500 text-sm italic'>System / Unknown</span>
      const firstName = user.first_name || ''
      const lastName = user.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || 'N/A'
      return (
        <div className='flex flex-col gap-1'>
          <span className='font-medium text-gray-900'>{fullName}</span>
          <span className='text-xs text-gray-500'>{user.email}</span>
        </div>
      )
    }
  },
  {
    header: 'Action',
    accessorKey: 'action',
    cell: ({ getValue }) => {
      const action = getValue() || ''
      let bgColor = 'bg-gray-100 text-gray-800'
      if (action.includes('Create') || action === 'POST') bgColor = 'bg-green-100 text-green-800'
      if (action.includes('Update') || action === 'PUT' || action === 'PATCH') bgColor = 'bg-blue-100 text-blue-800'
      if (action.includes('Delete') || action === 'DELETE') bgColor = 'bg-red-100 text-red-800'
      
      return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>
          {action}
        </span>
      )
    }
  },
  {
    header: 'Resource',
    accessorKey: 'resource',
    cell: ({ getValue }) => (
      <span className='text-gray-800 font-medium capitalize'>{getValue() || '-'}</span>
    )
  },
  {
    header: 'Details',
    accessorKey: 'details',
    cell: ({ getValue }) => {
      const details = getValue()
      if (!details) return <span className='text-gray-400 text-sm italic'>None</span>
      
      const displayStr = typeof details === 'object' 
        ? Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')
        : String(details)
        
      return <span className='text-gray-600 text-xs'>{displayStr}</span>
    }
  },
  {
    header: 'IP Address',
    accessorKey: 'ip_address',
    cell: ({ getValue }) => (
      <span className='text-gray-500 text-xs font-mono'>{getValue() || '-'}</span>
    )
  }
]
