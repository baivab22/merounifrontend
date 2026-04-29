import React, { useState } from 'react'
import ImageLightbox from '@/ui/molecules/image-lightbox'

const getEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null
  if (url.includes('youtube.com/embed/')) return url

  let videoId = ''
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

const GallerySection = ({ university }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  
  const images = Array.isArray(university?.gallery) ? university.gallery : []
  
  const rawVideos = university?.videos
  let videos = []
  if (Array.isArray(rawVideos)) {
    videos = rawVideos.map(v => (typeof v === 'string' ? v : v.url || v.file_url)).filter(Boolean)
  } else if (typeof rawVideos === 'string' && rawVideos.trim() !== '') {
    if (rawVideos.startsWith('[') && rawVideos.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawVideos)
        if (Array.isArray(parsed)) {
          videos = parsed.map(v => (typeof v === 'string' ? v : v.url || v.file_url)).filter(Boolean)
        } else {
          videos = [rawVideos]
        }
      } catch (e) {
        videos = [rawVideos]
      }
    } else {
      videos = [rawVideos]
    }
  }

  if (images.length === 0 && videos.length === 0) return null

  return (
    <div className='bg-white rounded-md border p-6 shadow-sm'>
      <h2 className='text-xl font-bold text-gray-900 mb-6'>Gallery</h2>

      {/* Photos Grid */}
      {images.length > 0 && (
        <div className='mb-10'>
          <h3 className='text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider'>Photos</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
            {images.map((img, idx) => (
              <div
                key={idx}
                className='group relative aspect-square rounded-md overflow-hidden cursor-pointer bg-gray-100 border'
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`${university?.fullname || 'Campus'} ${idx + 1}`}
                  className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300' />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 && (
        <div>
          <h3 className='text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider'>Videos</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {videos.map((videoUrl, index) => {
              const embedUrl = getEmbedUrl(videoUrl)
              if (!embedUrl) return null

              return (
                <div key={index} className='rounded-md overflow-hidden bg-gray-100 border'>
                  <div className='relative w-full pt-[56.25%]'>
                    <iframe
                      src={embedUrl}
                      title={`Video ${index + 1} for ${university?.fullname || 'University'}`}
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                      className='absolute top-0 left-0 w-full h-full border-0'
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
