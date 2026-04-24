import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/ui/shadcn/dialog'
import { authFetch } from '@/app/utils/authFetch'
import { useEffect, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'
import { useToast } from '@/hooks/use-toast'

const ViewReferableCollegesModal = ({ isOpen, onClose, onRemoveSuccess }) => {
  const { toast } = useToast()
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchReferableColleges = async () => {
    setLoading(true)
    try {
      const response = await authFetch(
        `${process.env.baseUrl}/college?is_referable=true&limit=1000`
      )
      if (response.ok) {
        const data = await response.json()
        setColleges(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching referable colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchReferableColleges()
    }
  }, [isOpen])

  const handleRemoveReferable = async (id) => {
    setActionLoading(id)
    try {
      const response = await authFetch(
        `${process.env.baseUrl}/college/${id}/referable`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_referable: false })
        }
      )

      if (response.ok) {
        setColleges((prev) => prev.filter((c) => c.id !== id))
        toast({
          title: 'Success',
          description: 'College removed from referable list'
        })
        if (onRemoveSuccess) onRemoveSuccess(id)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove college',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className='max-w-2xl'>
      <DialogContent className='max-h-[80vh] overflow-hidden flex flex-col p-0'>
        <DialogHeader className='p-6 border-b'>
          <DialogTitle className='text-xl font-bold'>
            Referable Colleges
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-12 gap-3 text-gray-500'>
              <Loader2 className='w-8 h-8 animate-spin text-[#387cae]' />
              <p>Fetching referable colleges...</p>
            </div>
          ) : colleges.length > 0 ? (
            <div className='space-y-4'>
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-white transition-all group'
                >
                  <div className='flex items-center gap-4'>
                    {college.college_logo ? (
                      <img
                        src={college.college_logo}
                        alt={college.name}
                        className='w-12 h-12 object-contain rounded bg-white border'
                      />
                    ) : (
                      <div className='w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-bold'>
                        LOGO
                      </div>
                    )}
                    <div>
                      <h4 className='font-semibold text-gray-900 group-hover:text-[#387cae] transition-colors'>
                        {college.name}
                      </h4>
                      <p className='text-xs text-gray-500'>
                        {college.institute_type || 'Institution'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleRemoveReferable(college.id)}
                    disabled={actionLoading === college.id}
                    className='text-red-600 hover:text-white hover:bg-red-600 border-red-100 hover:border-red-600 gap-2 h-9'
                  >
                    {actionLoading === college.id ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : (
                      <Trash2 className='w-3.5 h-3.5' />
                    )}
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <Trash2 className='w-8 h-8 opacity-20' />
              </div>
              <p className='text-lg font-medium'>No referable colleges found</p>
              <p className='text-sm'>
                Colleges marked as "Referable" will appear here.
              </p>
            </div>
          )}
        </div>

        <div className='p-6 border-t bg-gray-50 flex justify-end'>
          <Button
            onClick={onClose}
            className='bg-gray-800 hover:bg-gray-700 text-white px-8'
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReferableCollegesModal
