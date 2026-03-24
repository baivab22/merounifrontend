'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Share2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const ShareSection = ({ title, type = 'blog' }) => {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)
    const shareTitle = `Check out ${title || 'this ' + type} on our platform`
 
    const handleFacebookShare = () => {
        const url = window.location.href
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareTitle)}`,
            'facebook-share-dialog',
            'width=626,height=436'
        )
    }
 
    const handleTwitterShare = () => {
        const url = window.location.href
        window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle)}`,
            'twitter-share-dialog',
            'width=550,height=420'
        )
    }
 
    const handleLinkedInShare = () => {
        const url = window.location.href
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            'linkedin-share-dialog',
            'width=550,height=420'
        )
    }
 
    const handleCopyLink = () => {
        const url = window.location.href
        navigator.clipboard.writeText(`${shareTitle}\n${url}`)
        setCopied(true)
        toast({
            title: 'Copied',
            description: 'Link copied to clipboard!'
        })
        setTimeout(() => setCopied(false), 2000)
    }

    const shareItems = [
        { name: 'Facebook', icon: '/images/fb.png', onClick: handleFacebookShare },
        { name: 'Twitter', icon: '/images/twitter.png', onClick: handleTwitterShare },
        { name: 'LinkedIn', icon: '/images/linkedin.png', onClick: handleLinkedInShare },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className='fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none'
        >
            <div className='pointer-events-auto bg-white/95 backdrop-blur-xl border border-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-3 px-8 rounded-full flex items-center gap-6'>
                <div className='flex items-center gap-2 border-r border-gray-100 pr-4 mr-2'>
                    <div className='p-1.5 bg-[#387cae]/10 text-[#387cae] rounded-lg'>
                        <Share2 className='w-4 h-4' />
                    </div>
                    <span className='text-gray-900 text-xs uppercase tracking-[0.15em] font-extrabold'>
                        Share
                    </span>
                </div>

                <div className='flex items-center gap-5'>
                    {shareItems.map((item) => (
                        <motion.button
                            key={item.name}
                            onClick={item.onClick}
                            whileHover={{ y: -4, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className='relative group flex items-center justify-center'
                            aria-label={`Share on ${item.name}`}
                        >
                            <img src={item.icon} alt={item.name} className='w-5 h-5 object-contain filter group-hover:grayscale-0 transition-all duration-300' />
                            <div className='absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md font-bold whitespace-nowrap'>
                                {item.name}
                            </div>
                        </motion.button>
                    ))}

                    <motion.button
                        onClick={handleCopyLink}
                        whileHover={{ y: -4, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className='relative group flex items-center justify-center p-0.5'
                        aria-label='Copy link'
                    >
                        <AnimatePresence mode='wait'>
                            {copied ? (
                                <motion.div
                                    key='check'
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    className='text-emerald-500'
                                >
                                    <Check className='w-5 h-5' strokeWidth={3} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key='copy'
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    className='text-gray-400 group-hover:text-[#387cae] transition-colors'
                                >
                                    <Copy className='w-5 h-5' />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className='absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md font-bold whitespace-nowrap'>
                            {copied ? 'Copied!' : 'Copy Link'}
                        </div>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

export default ShareSection