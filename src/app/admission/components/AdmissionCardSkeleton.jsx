import { Skeleton } from '@/ui/shadcn/Skeleton'

const AdmissionCardSkeleton = () => {
  return (
    <div className='bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm flex flex-col h-full animate-pulse'>
      <Skeleton className='aspect-[16/9] w-full rounded-none' />
      <div className='p-5 flex flex-col flex-1'>
        <div className='flex items-start gap-3 mb-4'>
          <Skeleton className='w-10 h-10 rounded-md flex-shrink-0' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-5 w-4/5' />
            <Skeleton className='h-3 w-3/5' />
          </div>
        </div>
        <Skeleton className='h-6 w-36 rounded-md mb-5' />
        <div className='mt-auto pt-4 flex gap-2 border-t border-gray-100'>
          <Skeleton className='h-9 flex-1 rounded-lg' />
          <Skeleton className='h-9 flex-1 rounded-lg' />
        </div>
      </div>
    </div>
  )
}

export default AdmissionCardSkeleton
