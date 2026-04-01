import Link from 'next/link'
import { Globe, MapPin, Edit2, Trash2, UserPlus, Eye } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export const createColumns = ({
  handleView,
  handleEdit,
  handleOpenCredentialsModal,
  handleDeleteClick,
  handleImageClick,
  handleReferable
}) => [
    {
      header: '',
      accessorKey: 'college_logo',
      cell: ({ row, getValue }) => {
        const logoUrl = getValue()
        const schoolName = row.original.name
        return logoUrl ? (
          <div className='flex items-center justify-center'>
            <img
              src={logoUrl}
              alt='School Logo'
              className='w-20 h-20 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => handleImageClick(logoUrl, schoolName)}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center w-20 h-20 bg-gray-100 rounded'>
            <span className='text-gray-400 text-xs'>No Logo</span>
          </div>
        )
      }
    },
    {
      header: 'School Name',
      accessorKey: 'name',
      cell: ({ row }) => {
        const name = row.original.name
        const slugs = row.original.slugs
        const type = row.original.institute_type
        const websiteUrl = row.original.website_url
        return (
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              {slugs ? (
                <Link
                  href={`/schools/${slugs}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-semibold text-slate-900 hover:text-[#387cae] hover:underline'
                >
                  {name}
                </Link>
              ) : (
                <span>{name}</span>
              )}
              {type && (
                <span className='px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                  {type}
                </span>
              )}
            </div>
            {websiteUrl && (
              <a
                href={
                  websiteUrl.startsWith('http')
                    ? websiteUrl
                    : `https://${websiteUrl}`
                }
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline text-sm mt-1 inline-flex items-center gap-1'
              >
                <Globe className='inline w-4 h-4' /> {websiteUrl}
              </a>
            )}
          </div>
        )
      }
    },
    {
      header: 'Affiliation',
      accessorKey: 'universities',
      cell: ({ row }) => {
        const universities = row.original.universities || []
        if (!universities.length) return <span className='text-gray-400 text-sm'>—</span>
        return (
          <div className='flex flex-col gap-1'>
            {universities.map((u, i) => (
              <span key={i} className='text-sm text-gray-700 font-medium'>{u.fullname || u.name}</span>
            ))}
          </div>
        )
      }
    },
    {
      header: 'Address',
      accessorKey: 'collegeAddress',
      cell: ({ row }) => {
        const address = row.original.collegeAddress || {}
        const location = [address.city, address.district, address.country].filter(Boolean).join(', ')
        const mapUrl = row.original.google_map_url
        const mapType = row.original.map_type
        const isGoogleMap = mapType === 'google_map' || mapType === 'googlemap'
        if (!location && !mapUrl) return <span className='text-gray-400 text-sm'>—</span>
        return (
          <div className='flex flex-col'>
            {location && <span className='text-sm text-gray-700'>{location}</span>}
            {mapUrl && isGoogleMap && (
              <a href={mapUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline text-xs mt-1 inline-flex items-center gap-1'>
                <MapPin className='inline w-3 h-3' /> View Map
              </a>
            )}
          </div>
        )
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue()
        return (
          <span
            className={cn(
              'px-2 py-1 text-[10px] font-semibold uppercase rounded-md',
              status === 'published'
                ? 'bg-green-50 text-green-600 border border-green-100'
                : 'bg-gray-50 text-gray-500 border border-gray-100'
            )}
          >
            {status || 'Published'}
          </span>
        )
      }
    },
    {
      header: 'Is Referable',
      accessorKey: 'is_referable',
      cell: ({ row }) => {
        const isReferable = row.original.is_referable
        const id = row.original.id
        return (
          <div className='flex items-center justify-center'>
            <input
              type='checkbox'
              checked={!!isReferable}
              onChange={(e) => handleReferable(id, e.target.checked)}
              className='w-4 h-4 accent-[#387cae] cursor-pointer'
              title={isReferable ? 'Referrable' : 'Not Referrable'}
            />
          </div>
        )
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        const hasAccount =
          row.original.has_account === true || row.original.has_account === 1
        return (
          <div className='flex gap-2'>
            <button
              onClick={() => handleView(row.original.slugs)}
              className='p-1 text-purple-600 hover:text-purple-800'
              title='View Details'
            >
              <Eye className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleEdit(row.original.slugs)}
              className='p-1 text-blue-600 hover:text-blue-800'
              title='Edit'
            >
              <Edit2 className='w-4 h-4' />
            </button>
            {!hasAccount && (
              <button
                onClick={() => handleOpenCredentialsModal(row.original)}
                className='p-1 text-green-600 hover:text-green-800'
                title='Create Credentials'
              >
                <UserPlus className='w-4 h-4' />
              </button>
            )}
            <button
              onClick={() => handleDeleteClick(row.original.id)}
              className='p-1 text-red-600 hover:text-red-800'
              title='Delete'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        )
      }
    }
  ]
