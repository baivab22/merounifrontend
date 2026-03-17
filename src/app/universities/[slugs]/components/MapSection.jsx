import { FaMapMarkerAlt } from 'react-icons/fa'

const MapSection = ({ university, className }) => {
    const mapValue = university?.map

    if (!mapValue) return null

    // Helper to extract URL if the input is an iframe string
    const getMapUrl = (val) => {
        if (typeof val !== 'string') return null
        if (val.includes('<iframe')) {
            const match = val.match(/src="([^"]+)"/)
            return match ? match[1] : null
        }
        return val
    }

    const mapUrl = getMapUrl(mapValue)

    return (
        <div className={className}>
            <div className='bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2'>
                <div className='relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-50'>
                    {mapUrl ? (
                        <iframe
                            src={mapUrl}
                            className='absolute inset-0 w-full h-full border-0 grayscale-[0.2] contrast-[1.1]'
                            allowFullScreen=''
                            loading='lazy'
                            title='University Location'
                        />
                    ) : (
                        <div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
                            <FaMapMarkerAlt className='text-slate-300' size={24} />
                            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Map View</p>
                        </div>
                    )}
                </div>
                <div className='p-4 pt-3'>
                    <div className='flex items-center gap-2 mb-1'>
                        <div className='w-1.5 h-1.5 rounded-full bg-[#30AD8F]' />
                        <h3 className='text-xs font-bold text-slate-800 uppercase tracking-tight'>Campus Location</h3>
                    </div>
                    <p className='text-[10px] text-slate-500 leading-relaxed line-clamp-2'>
                        {university?.street}, {university?.city}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MapSection
