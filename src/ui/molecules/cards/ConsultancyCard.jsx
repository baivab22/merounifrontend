'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Heart } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'
import { authFetch } from '@/app/utils/authFetch'

const ConsultancyCard = ({ consultancy }) => {
  const { toast } = useToast()
  const user = useSelector((state) => state.user.data)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const consultancyId = consultancy?.id
  const slug = consultancy?.slugs
  const destinations = (() => {
    try {
      return typeof consultancy.destination === 'string'
        ? JSON.parse(consultancy.destination || '[]')
        : consultancy.destination || []
    } catch {
      return []
    }
  })()
  const address = (() => {
    try {
      return typeof consultancy.address === 'string'
        ? JSON.parse(consultancy.address || '{}')
        : consultancy.address || {}
    } catch {
      return {}
    }
  })()
  const locationText = [address.street, address.city].filter(Boolean).join(', ')
  const description = consultancy?.description?.replace(/<[^>]*>/g, '') || ''
  const logo = consultancy?.logo
  const image = consultancy?.featured_image || ''
  const isPinned = consultancy?.pinned === 1

  useEffect(() => {
    if (user?.id && consultancyId) {
      checkWishlistStatus()
    }
  }, [user?.id, consultancyId])

  const checkWishlistStatus = async () => {
    try {
      const response = await authFetch(
        `${process.env.baseUrl}/wishlist?user_id=${user.id}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      )
      if (!response.ok) return
      const data = await response.json()
      const inList = (data.items || []).some(
        (item) => item.consultancy?.id === consultancyId
      )
      setIsInWishlist(inList)
    } catch {
      setIsInWishlist(false)
    }
  }

  const handleWishlistToggle = async (e) => {
    e.stopPropagation()
    e.preventDefault()

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
        body: JSON.stringify({
          consultancy_id: consultancyId,
          user_id: user.id
        })
      })
      if (!response.ok) throw new Error('Wishlist request failed')

      setIsInWishlist(!isInWishlist)
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

  return (
    <Link
      href={slug ? `/consultancy/${slug}` : '#'}
      className='group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6FA7] focus-visible:ring-offset-2 rounded-md relative'
    >
      <article className='bg-white rounded-md border border-gray-200/80 overflow-hidden h-full flex flex-col hover:border-gray-300 hover:shadow-md transition-all duration-200'>
        {/* Image — fixed 16:9 aspect ratio so image never stretches */}
        <div className='relative w-full aspect-[16/9] bg-gray-100 overflow-hidden'>
          <Image
            src={image || 'https://placehold.co/600x400?text=Consultancy'}
            alt={consultancy?.title || 'Consultancy'}
            fill
            className='object-cover group-hover:scale-[1.02] transition-transform duration-300'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none' />

          {/* Wishlist Button */}
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
                  onClick={(e) => {
                    e.preventDefault() // Link wrapper might catch click otherwise
                    handleWishlistToggle(e)
                  }}
                  disabled={isLoading}
                  className='p-2 bg-white/80 hover:bg-white rounded-full transition-all shadow-sm'
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      isInWishlist
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    } ${isLoading ? 'opacity-50' : ''}`}
                  />
                </button>
              )
            })()}
          </div>

          {isPinned && (
            <span className='absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 text-xs font-semibold text-[#0A6FA7] shadow-sm z-10'>
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className='p-5 flex flex-col flex-1 min-w-0'>
          <div className='flex items-start gap-3 mb-4'>
            {logo && (
              <div className='relative w-10 h-10 flex-shrink-0 rounded-md bg-gray-50 border border-gray-100 overflow-hidden'>
                <Image src={logo} alt='' fill className='object-contain p-1' />
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <h2 className='text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0A6FA7] transition-colors mb-1'>
                {consultancy?.title || 'Consultancy'}
              </h2>
              {locationText && (
                <div className='flex items-center gap-1.5 text-sm text-gray-500 min-w-0'>
                  <MapPin className='w-3.5 h-3.5 flex-shrink-0 text-[#0A6FA7]' />
                  <span className='truncate'>{locationText}</span>
                </div>
              )}
            </div>
          </div>

          <div className='mt-auto pt-4'>
            {destinations.length > 0 && (
              <div className='pt-4 border-t border-gray-100 flex flex-wrap gap-1.5'>
                {destinations.slice(0, 3).map((d, i) => (
                  <span
                    key={i}
                    className='inline-flex px-2 py-0.5 rounded-md bg-gray-50 text-xs font-medium text-gray-600'
                  >
                    {typeof d === 'string' ? d : d.country}
                  </span>
                ))}
                {destinations.length > 3 && (
                  <span className='inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[#0A6FA7]'>
                    +{destinations.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ConsultancyCard
