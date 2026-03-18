'use client'

import React from 'react'
import he from 'he'
import { cn } from '@/app/lib/utils'

/**
 * Reusable HTML Renderer component to handle dangerouslySetInnerHTML safely and with consistent styling.
 * 
 * @param {Object} props
 * @param {string} props.html - The raw HTML string to render
 * @param {string} props.className - Additional classes for the container
 * @param {boolean} props.processTables - Whether to wrap tables in a scrollable container (default: true)
 */
const HTMLRenderer = ({ html, className, processTables = true }) => {
    if (!html) return null

    // Process content: wrap tables, handle common formatting
    const processContent = (inputHtml) => {
        let processedHtml = he.decode(inputHtml)

        if (processTables) {
            processedHtml = processedHtml.replace(
                /<table([^>]*)>([\s\S]*?)<\/table>/g,
                '<div class="table-wrapper"><table$1>$2</table></div>'
            )
        }

        return processedHtml
    }

    return (
        <div
            dangerouslySetInnerHTML={{
                __html: processContent(html)
            }}
            className={cn(
                'text-gray-600 leading-relaxed text-sm md:text-base selection:bg-[#0A6FA7]/10',

                // Headings
                '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-10 [&_h1]:mb-6',
                '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4',
                '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3',
                '[&_h4]:text-base [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:mt-4 [&_h4]:mb-2',

                // Paragraphs
                '[&_p]:mb-4 [&_p]:last:mb-0',

                // Lists
                '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul]:space-y-1.5',
                '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol]:space-y-1.5',
                '[&_li]:pl-1',
                '[&_li>ul]:my-2 [&_li>ol]:my-2',

                // Links
                '[&_a]:text-[#0A6FA7] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#0A6FA7]/30 [&_a]:hover:decoration-[#0A6FA7] [&_a]:transition-all',

                // Images & Media
                '[&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-8 [&_img]:max-w-full [&_img]:h-auto',
                '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-lg [&_iframe]:my-8 [&_iframe]:border-0',

                // Tables
                '[&_.table-wrapper]:overflow-x-auto [&_.table-wrapper]:my-8 [&_.table-wrapper]:rounded-xl [&_.table-wrapper]:border [&_.table-wrapper]:border-gray-200 [&_.table-wrapper]:shadow-sm',
                '[&_table]:min-w-full [&_table]:border-collapse [&_table]:bg-white',
                '[&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-gray-900 [&_th]:uppercase [&_th]:tracking-wider [&_th]:border-b [&_th]:border-gray-200',
                '[&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_td]:text-gray-600 [&_td]:border-b [&_td]:border-gray-100',
                '[&_tr:last-child_td]:border-b-0',
                '[&_tr:hover]:bg-gray-50/50 [&_tr]:transition-colors',

                // Blockquotes
                '[&_blockquote]:border-l-4 [&_blockquote]:border-[#0A6FA7] [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:bg-blue-50/30 [&_blockquote]:rounded-r-lg',

                // Code
                '[&_code]:bg-gray-100 [&_code]:text-[#0A6FA7] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',

                className
            )}
        />
    )
}

export default HTMLRenderer
