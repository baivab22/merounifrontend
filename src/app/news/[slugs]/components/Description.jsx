import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ news }) => {
    return (
        <div className='mb-10'>
            {/* Introduction/Description */}
            {news?.description && (
                <HTMLRenderer
                    html={news.description}
                    className="mb-10 [&_p]:text-gray-700 [&_p]:text-lg md:[&_p]:text-xl"
                />
            )}

            {/* Main Content */}
            <HTMLRenderer html={news?.content} />
        </div>
    )
}

export default Description
