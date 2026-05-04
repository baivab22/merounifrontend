'use client'

import { useState, useEffect } from 'react'
import { Heart, Info, GraduationCap, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSelector } from 'react-redux'
import { authFetch } from '@/app/utils/authFetch'
import { useRouter } from '@bprogress/next/app'
import Link from 'next/link'

import Image from 'next/image'

const CollegeCard = ({
  college: collegeProp,
  name: nameProp,
  location: locationProp,
  collegeId: collegeIdProp,
  slug: slugProp,
  collegeImage: collegeImageProp,
  instituteType: instituteTypeProp,
  universityName: universityNameProp,
  logo: logoProp,
  degrees: degreesProp,
  wishlistCollegeIds,
  onWishlistUpdate
}) => {
  const { toast } = useToast()
  const router = useRouter()
  const user = useSelector((state) => state.user.data)

  const name = collegeProp?.name ?? nameProp
  const slug = collegeProp?.slugs ?? collegeProp?.slug ?? slugProp
  const collegeId = collegeProp?.id ?? collegeIdProp
  const collegeImage =
    collegeProp?.featured_img ?? collegeProp?.featuredImg ?? collegeImageProp
  const instituteType =
    instituteTypeProp ??
    collegeProp?.institute_type ??
    collegeProp?.instituteType
  const universityName =
    collegeProp?.university?.fullname ??
    collegeProp?.university?.name ??
    universityNameProp
  const logo = logoProp ?? collegeProp?.college_logo ?? collegeProp?.logo ?? '/images/logo.png'
  const degrees = degreesProp ?? collegeProp?.degrees ?? []

  const location =
    locationProp ??
    (collegeProp?.collegeAddress || collegeProp?.address
      ? [
          collegeProp?.collegeAddress?.street || collegeProp?.address?.street,
          collegeProp?.collegeAddress?.city ||
            collegeProp?.address?.city ||
            collegeProp?.collegeAddress?.district ||
            collegeProp?.address?.district
        ]
          .filter(Boolean)
          .join(', ')
      : '')

  const isParentControlledWishlist =
    wishlistCollegeIds != null && typeof onWishlistUpdate === 'function'
  const isInWishlistFromParent = wishlistCollegeIds?.has(collegeId)

  const [isInWishlistLocal, setIsInWishlistLocal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isInWishlist = isParentControlledWishlist
    ? isInWishlistFromParent
    : isInWishlistLocal

  useEffect(() => {
    if (!isParentControlledWishlist && user?.id && collegeId) {
      checkWishlistStatus()
    }
  }, [user?.id, collegeId, isParentControlledWishlist])

  const checkWishlistStatus = async () => {
    try {
      const response = await authFetch(
        `${process.env.baseUrl}/wishlist?user_id=${user.id}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      )
      if (!response.ok) return
      const data = await response.json()
      const inList = (data.items || []).some(
        (item) => item.college?.id === collegeId
      )
      setIsInWishlistLocal(inList)
    } catch {
      setIsInWishlistLocal(false)
    }
  }

  const handleWishlistToggle = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast({
        title: 'Sign in Required',
        description: 'Please sign in to manage your wishlist',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const method = isInWishlist ? 'DELETE' : 'POST'
      const response = await authFetch(`${process.env.baseUrl}/wishlist`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: collegeId, user_id: user.id })
      })
      if (!response.ok) throw new Error('Wishlist request failed')

      if (isParentControlledWishlist && onWishlistUpdate) {
        const newSet = new Set(wishlistCollegeIds)
        if (method === 'DELETE') newSet.delete(collegeId)
        else newSet.add(collegeId)
        onWishlistUpdate(newSet)
      } else {
        setIsInWishlistLocal(!isInWishlist)
      }

      toast({
        title: 'Success',
        description:
          method === 'DELETE'
            ? 'Successfully removed from wishlist'
            : 'Successfully added to wishlist'
      })
    } catch (err) {
      console.error('Wishlist update error:', err)
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    if (slug) {
      router.push(`/colleges/${slug}`)
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className='group bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full'
    >
      {/* Banner / Featured Image */}
      <div className='relative w-full aspect-[16/9] overflow-hidden bg-gray-100'>
        <Image
          src={collegeImage || '/images/logo.png'}
          alt={name || 'College'}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          className='object-cover group-hover:scale-[1.03] transition-transform duration-500'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60' />

        <div className='absolute top-3 left-3 flex gap-2 z-10'>
          <span className='bg-white/95 px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0A70A7] uppercase tracking-wider shadow-sm backdrop-blur-sm'>
            {instituteType || 'College'}
          </span>
        </div>

        <div className='absolute top-3 right-3 z-10'>
          {(() => {
            if (!user) return null
            try {
              const roles =
                typeof user.role === 'string'
                  ? JSON.parse(user.role)
                  : user.role
              if (roles?.admin || roles?.editor) return null
            } catch (err) {
              console.error('Error parsing user roles:', err)
            }
            return (
              <button
                type='button'
                onClick={handleWishlistToggle}
                disabled={isLoading}
                className='p-2 bg-white/80 hover:bg-white rounded-full transition-all shadow-sm'
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
              </button>
            )
          })()}
        </div>
      </div>

      {/* Content Section */}
      <div className='p-5 flex flex-col flex-1 min-w-0'>
        {/* Logo and Title Header */}
        <div className='flex items-start gap-3 mb-4'>
          {logo && (
            <div className='relative w-10 h-10 flex-shrink-0 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shadow-sm'>
              <img
                src={logo}
                alt=''
                className='w-full h-full object-contain p-1'
              />
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <h3 className='text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0A70A7] transition-colors mb-2'>
              {name}
            </h3>
            {location && (
              <div className='flex items-center gap-1 text-[11px] font-medium text-gray-500'>
                <MapPin className='w-3 h-3 text-[#0A70A7] flex-shrink-0' />
                <span className='truncate'>{location}</span>
              </div>
            )}
          </div>
        </div>

        {universityName && (
          <p className='text-[11px] font-medium text-gray-400 line-clamp-1 mb-3 italic px-1'>
            {universityName}
          </p>
        )}

        {degrees?.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mb-5'>
            {degrees.slice(0, 4).map((prog) => {
              const abbreviation =
                prog.short_name ||
                prog.shortName ||
                prog.title.match(/\(([^)]+)\)/)?.[1] ||
                prog.title
              return (
                <Link
                  key={prog.id}
                  href={`/degree/${prog.slugs || prog.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className='text-[10px] bg-[#0A70A7]/5 text-[#0A70A7] px-2 py-0.5 rounded-md border border-[#0A70A7]/10 font-bold whitespace-nowrap hover:bg-[#0A70A7] hover:text-white transition-colors'
                >
                  {abbreviation}
                </Link>
              )
            })}
            {degrees.length > 4 && (
              <span className='text-[10px] text-gray-400 font-medium self-center ml-0.5'>
                +{degrees.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className='mt-auto pt-4 flex items-center gap-2 border-t border-gray-100'>
          <Link
            href={slug ? `/colleges/apply/${slug}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className='flex-1 py-2 px-3 bg-[#0A70A7] text-white rounded-lg hover:bg-[#085a86] transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider'
          >
            <GraduationCap className='w-3.5 h-3.5' />
            Apply
          </Link>
          <Link
            href={slug ? `/colleges/${slug}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className='flex-1 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider border border-gray-200/50'
          >
            <Info className='w-3.5 h-3.5' />
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CollegeCard
