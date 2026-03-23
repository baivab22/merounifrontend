import { useToast } from '@/hooks/use-toast'
import { Button } from '@/ui/shadcn/button'
import { Label } from '@/ui/shadcn/label'
import axios from 'axios'
import { Download, ExternalLink, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const MultiFileUpload = ({
  onUploadComplete,
  label,
  required = false,
  initialFiles = [],
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
}) => {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [fileUrls, setFileUrls] = useState([])
  const fileInputRef = useRef(null)
  const user = useSelector((state) => state.user.data)

  const authorId = 1

  console.log(authorId,"AUTHOR ID")
  useEffect(() => {
    if (initialFiles) {
      const urlsArray = Array.isArray(initialFiles) 
        ? initialFiles 
        : (typeof initialFiles === 'string' ? initialFiles.split(',').filter(Boolean) : [])
      
      if (JSON.stringify(urlsArray) !== JSON.stringify(fileUrls)) {
        setFileUrls(urlsArray)
      }
    } else if (fileUrls.length > 0) {
        setFileUrls([])
    }
  }, [initialFiles])

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setIsUploading(true)
    const newlyUploaded = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('title', file.name)
        formData.append('altText', file.name)
        formData.append('description', '')
        formData.append('authorId', authorId || '1')
        formData.append('file', file)

        const response = await axios.post(
          `${process.env.mediaUrl}${process.env.version}/media/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        if (response.data.success) {
          newlyUploaded.push(response.data.media.url)
        }
      }

      const updatedUrls = [...fileUrls, ...newlyUploaded]
      setFileUrls(updatedUrls)
      onUploadComplete(updatedUrls)

      toast({
        title: 'Success',
        description: `Successfully uploaded ${newlyUploaded.length} document(s)`
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document(s). Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = (urlToRemove) => {
    const updatedUrls = fileUrls.filter((url) => url !== urlToRemove)
    setFileUrls(updatedUrls)
    onUploadComplete(updatedUrls)
  }

  return (
    <div className='bg-white p-3 rounded-2xl border border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-[#387cae]/10 flex items-center justify-center text-[#387cae]'>
                <FileText size={16} />
            </div>
            {label && <Label required={required} className="text-xs font-bold text-gray-700 uppercase tracking-widest leading-none">{label}</Label>}
        </div>
        
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-9 rounded-xl border-[#387cae]/20 text-[#387cae] hover:bg-[#387cae]/5 font-bold text-[11px] gap-2 uppercase tracking-wider'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 size={14} className='animate-spin' />
          ) : (
            <Plus size={14} />
          )}
          {isUploading ? 'Uploading...' : 'Add Documents'}
        </Button>

        <input
          type='file'
          ref={fileInputRef}
          onChange={handleUpload}
          accept={accept}
          multiple
          className='hidden'
          disabled={isUploading}
        />
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {fileUrls.map((url, index) => (
          <div 
            key={url || index} 
            className='group relative flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl transition-all hover:bg-white hover:border-[#387cae]/30 hover:shadow-lg hover:shadow-[#387cae]/5'
          >
            <div className='w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#387cae] shrink-0 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform'>
              <FileText size={20} />
            </div>
            
            <div className='flex-1 min-w-0'>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Resource #{index + 1}</p>
              <div className='flex items-center gap-2'>
                <a 
                  href={url} 
                  target='_blank' 
                  rel='noopener noreferrer' 
                  className='text-[11px] text-gray-900 hover:text-[#387cae] font-bold truncate max-w-[150px] md:max-w-[250px]'
                >
                  {url.split('/').pop()}
                </a>
                <ExternalLink size={10} className="text-gray-300" />
              </div>
            </div>

            <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all'>
                <a 
                    href={url} 
                    download 
                    target='_blank'
                    className='p-2 rounded-lg text-gray-400 hover:text-[#387cae] hover:bg-gray-100 transition-all'
                    title="Download document"
                >
                    <Download size={16} />
                </a>
                <button
                    type='button'
                    onClick={() => removeFile(url)}
                    className='p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all'
                    title="Remove document"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}

        {fileUrls.length === 0 && !isUploading && (
           <div className='py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/30'>
             <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-300'>
               <FileText size={18} />
             </div>
             <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>No documents yet</p>
           </div>
        )}

        {isUploading && (
           <div className='p-4 rounded-2xl border-2 border-dashed border-[#387cae]/20 bg-[#387cae]/5 flex items-center justify-center gap-3 animate-pulse'>
              <Loader2 size={18} className='text-[#387cae] animate-spin' />
              <span className='text-[10px] font-bold text-[#387cae] uppercase tracking-widest'>Processing Upload...</span>
           </div>
        )}
      </div>
    </div>
  )
}

export default MultiFileUpload
