import React from 'react'

const Description = ({ blog }) => {
  // Function to wrap tables in a scrollable container
  const processContent = (html) => {
    if (!html) return ''
    return html.replace(
      /<table([^>]*)>([\s\S]*?)<\/table>/g,
      '<div class="table-wrapper"><table$1>$2</table></div>'
    )
  }

  return (
    <div className='max-w-[900px] mx-auto mb-10'>
      {/* Blog Introduction/Description */}
      {blog?.description && (
        <div
          className='prose prose-slate max-w-none mb-10 
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg md:prose-xl'
          dangerouslySetInnerHTML={{ __html: blog?.description }}
        />
      )}

      {/* Main Blog Content */}
      <div
        className='prose prose-slate max-w-none 
        /* Typography Scale */
        prose-base md:prose-lg
        
        /* Heading Styles */
        prose-headings:font-bold prose-headings:text-black 
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        
        /* Paragraph & Text Styles */
        prose-p:text-black/80 prose-p:leading-relaxed prose-p:text-justify
        prose-li:text-black/80 prose-li:my-2
        prose-strong:text-black prose-strong:font-bold
        
        /* Link Styles */
        prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline
        
        /* List Styles */
        prose-ul:list-disc prose-ol:list-decimal
        
        /* Blockquote Styles */
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
        
        /* Table styles */
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-8
        [&_th]:bg-gray-100 [&_th]:p-3 [&_th]:border [&_th]:border-gray-300 [&_th]:text-left
        [&_td]:p-3 [&_td]:border [&_td]:border-gray-300
        
        /* Image styles inside content */
        prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-10
        
        /* Table wrapper from processContent */
        [&_.table-wrapper]:overflow-x-auto
        [&_.table-wrapper]:my-6
        [&_.table-wrapper]:w-full
        [&_.table-wrapper]:[scrollbar-width:thin]
        [&_.table-wrapper]:[scrollbar-color:rgb(209,213,219)_transparent]'
        dangerouslySetInnerHTML={{ __html: processContent(blog?.content) }}
      />
    </div>
  )
}

export default Description

