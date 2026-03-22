import React from 'react'

const getEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('youtube.com/embed/')) return url

  let videoId = ''
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

const VideoSection = ({ university }) => {
  const videos = Array.isArray(university?.videos) ? university.videos : []

  if (videos.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-1.5 h-6 bg-red-500 rounded-full' />
          <h2 className='text-xl font-bold text-gray-900'>Campus Videos</h2>
        </div>
        {videos.length > 1 && (
          <span className='text-sm font-medium bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100 shadow-sm'>
            {videos.length} Videos
          </span>
        )}
      </div>

      <div className={`grid gap-6 ${videos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {videos.map((videoUrl, index) => {
          const embedUrl = getEmbedUrl(videoUrl)
          if (!embedUrl) return null

          return (
            <div
              key={index}
              className='group relative w-full rounded-2xl overflow-hidden aspect-video shadow-sm hover:shadow-xl transition-all duration-300 border border-white bg-black'
            >
              <iframe
                src={embedUrl}
                title={`YouTube video ${index + 1}`}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                className='w-full h-full opacity-95 group-hover:opacity-100 transition-opacity'
              />
              <div className='absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-red-500/10 rounded-2xl transition-all duration-300' />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VideoSection
