import React, { useState } from 'react'
import ImageLightbox from '@/ui/molecules/image-lightbox'

const GallerySection = ({ university }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const images = Array.isArray(university?.gallery) ? university.gallery : []

  if (images.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-1.5 h-6 bg-amber-500 rounded-full' />
          <h2 className='text-xl font-bold text-gray-900'>Campus Gallery</h2>
        </div>
        <span className='text-sm font-medium bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm'>
          {images.length} Photo{images.length > 1 && 's'}
        </span>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
        {images.map((img, idx) => (
          <div
            key={idx}
            className='group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-white hover:-translate-y-1'
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img}
              alt={`${university?.fullname || 'Campus'} ${idx + 1}`}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300' />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <span className='bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30'>
                View
              </span>
            </div>
          </div>
        ))}
      </div>

      <ImageLightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
        altText={university?.fullname}
      />
    </div>
  )
}

export default GallerySection
