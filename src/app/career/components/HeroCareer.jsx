import React from 'react'

const HeroCareer = ({ career }) => {
  // Get current page URL to share
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `Check out blogs on our platform`

  // Social share handlers
  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareTitle)}`,
      'facebook-share-dialog',
      'width=626,height=436'
    )
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      'twitter-share-dialog',
      'width=550,height=420'
    )
  }

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      'linkedin-share-dialog',
      'width=550,height=420'
    )
  }
  const handleInstagramShare = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${currentUrl}`)
    alert('Link copied to clipboard! You can now paste it in Instagram')
  }
  const handleWhatsAppShare = () => {
    const message = `${career.title} - Check out this blog on our platform\n${currentUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      'whatsapp-share-dialog',
      'width=600,height=500'
    )
  }
  return (
    <div className='relative'>
      <div className='w-full h-[250px] sm:h-[400px] md:h-[480px]'>
        <img
          src={career.featuredImage || 'https://placehold.co/600x400'}
          alt={career.title || 'career'}
          className='w-full h-full'
        />

        <div className='absolute bg-black/50 w-full h-full inset-0 '></div>
        <div className='absolute left-5 md:left-10 lg:left-20 bottom-[20%] text-white w-[15rem] min-[433px]:w-[20rem] sm:w-[30rem] lg:w-[50rem] md:w-[40rem] font-bold  px-4'>
          <p className='text-lg leading-1 md:text-3xl lg:text-4xl '>
            {career.title}
          </p>
          <div className='font-medium text-xs my-2'>
            - {career.careerAuthor.firstName}{' '}
            {career.careerAuthor.middleName || ''}{' '}
            {career.careerAuthor.lastName}
          </div>
        </div>
      </div>

      {/* Social share icons remain the same */}
      <div className='space-y-4 z-10 text-[#b0b2c3] fixed left-4 top-[30%] lg:block md:-translate-y-1 bg-white p-2 rounded-md flex items-center flex-col'>
        <div className='text-black font-bold text-sm'>Share</div>
        <div className='flex flex-col gap-4 items-center'>
          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share on Facebook'
          >
            <img src='/images/fb.png' alt='Facebook' className='w-6' />
          </button>

          {/* Twitter/X */}
          <button
            onClick={handleTwitterShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share on Twitter'
          >
            <img src='/images/twitter.png' alt='Twitter' className='w-6' />
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedInShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share on LinkedIn'
          >
            <img src='/images/linkedin.png' alt='LinkedIn' className='w-6' />
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share on WhatsApp'
          >
            <svg viewBox='0 0 24 24' fill='currentColor' className='w-6'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share on Instagram'
          >
            <img src='/images/insta.png' alt='Instagram' className='w-6' />
          </button>

          {/* Native Share */}
          {/* <button
            onClick={handleNativeShare}
            className='hover:opacity-80 transition-opacity hover:scale-110'
            aria-label='Share'
          >
            <img src='/images/share.png' alt='Share' className='w-6' />
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default HeroCareer
