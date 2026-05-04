import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '@/ui/shadcn/dialog'
import { Globe, MapPin, University, Phone, Eye, Award, Users, BookOpen, Settings, MessageCircle, ImageIcon } from 'lucide-react'
import HTMLRenderer from '@/ui/HTMLRenderer'
import { motion } from 'framer-motion'

const ViewCollegeModal = ({
    viewModalOpen,
    handleCloseViewModal,
    loadingView,
    viewCollegeData: college
}) => {
    if (!viewModalOpen) return null;

    const hasAddress = !!(college?.collegeAddress?.street || college?.collegeAddress?.city);
    const hasContacts = college?.collegeContacts && college.collegeContacts.length > 0;
    const hasWebsite = !!college?.website_url;
    const hasUniversity = college?.universities && college.universities.length > 0;

    return (
        <Dialog
            isOpen={viewModalOpen}
            onClose={handleCloseViewModal}
            className='max-w-6xl'
        >
            <DialogContent className='max-h-[95vh] overflow-y-auto p-0 border-0 bg-[#F8FAFC]'>
                <DialogHeader className="hidden">
                    <DialogTitle>College Details</DialogTitle>
                </DialogHeader>
                
                <div className="sticky top-0 right-0 z-50 flex justify-end p-4 pointer-events-none">
                    <button 
                        onClick={handleCloseViewModal}
                        className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20 pointer-events-auto"
                    >
                        <DialogClose className="w-5 h-5" />
                    </button>
                </div>

                {loadingView ? (
                    <div className='flex items-center justify-center py-24'>
                        <div className="flex flex-col items-center gap-4">
                            <div className='w-12 h-12 border-4 border-[#387cae]/20 border-t-[#387cae] rounded-full animate-spin' />
                            <p className="text-slate-400 font-medium animate-pulse">Fetching college details...</p>
                        </div>
                    </div>
                ) : college ? (
                    <div className='pb-12'>
                        {/* Hero Section */}
                        <div className='w-full relative bg-white'>
                            <div className='w-full relative aspect-[21/9] sm:aspect-[21/7] overflow-hidden'>
                                <img
                                    src={college?.featured_img || '/images/degreeHero.webp'}
                                    alt='College Photo'
                                    className='w-full h-full object-cover'
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
                            </div>

                            {/* Info Bar with Popping Logo */}
                            <div className='flex flex-row items-end px-6 md:px-12 gap-6 -mt-12 md:-mt-16 pb-6 relative z-10'>
                                {/* Logo */}
                                <div className='flex items-center justify-center rounded-2xl bg-white overflow-hidden w-24 h-24 md:w-32 md:h-32 flex-shrink-0 shadow-2xl border-4 border-white transition-transform duration-300'>
                                    {college?.college_logo ? (
                                        <img
                                            src={college.college_logo}
                                            alt='Logo'
                                            className='object-contain w-full h-full p-2'
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-[#387cae]/10 text-[#387cae]">
                                            {college?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Name & Basic Info */}
                                <div className='flex-1 min-w-0 pb-2'>
                                    <h1 className='font-bold text-2xl md:text-4xl text-gray-900 truncate leading-tight drop-shadow-sm'>
                                        {college?.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {college.institute_type && (
                                            <span className="px-3 py-1 bg-blue-50 text-[#0A6FA7] text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                                                {college.institute_type}
                                            </span>
                                        )}
                                        {hasAddress && (
                                            <div className='flex items-center gap-1.5 text-gray-500 font-medium text-sm'>
                                                <MapPin className='w-4 h-4 text-[#30AD8F]' />
                                                <span>{college?.collegeAddress?.city}, {college?.collegeAddress?.district}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="px-6 md:px-12 -mt-4 mb-8">
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-[#387cae]/30 transition-all'>
                                    <div className='bg-blue-50 p-3 rounded-xl text-[#0A6FA7] group-hover:bg-[#0A6FA7] group-hover:text-white transition-colors'>
                                        <University size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Affiliation</p>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                                            {college.universities?.map(u => u.fullname || u.name).join(', ') || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition-all'>
                                    <div className='bg-orange-50 p-3 rounded-xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors'>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {college.collegeContacts?.[0]?.contact_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-sky-200 transition-all'>
                                    <div className='bg-sky-50 p-3 rounded-xl text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors'>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website</p>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                                            {college.website_url?.replace(/^https?:\/\/(www\.)?/, '') || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all'>
                                    <div className='bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors'>
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                        <p className="text-sm font-bold text-slate-700 capitalize">
                                            {college.status || 'Published'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Overview & Programs */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Overview */}
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-[#0A6FA7] rounded-full" />
                                        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
                                    </div>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {college.description && <p className="mb-6">{college.description}</p>}
                                        <HTMLRenderer html={college.content} />
                                    </div>
                                </div>

                                {/* Programs */}
                                {college.collegePrograms?.length > 0 && (
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-1.5 h-6 bg-[#30AD8F] rounded-full" />
                                            <h2 className="text-xl font-bold text-gray-900">Available Programs</h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {college.collegePrograms.map((cp, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                                    <div className="bg-white p-2 rounded-lg text-[#0A6FA7] shadow-sm">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">{cp.program?.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Facilities */}
                                {college.facilities?.length > 0 && (
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                            <h2 className="text-xl font-bold text-gray-900">Facilities</h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                            {college.facilities.map((f, idx) => (
                                                <div key={idx} className="flex flex-col items-center text-center gap-3">
                                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                                        <Settings size={20} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{f.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Address, Members, Gallery */}
                            <div className="space-y-8">
                                {/* Address & Map */}
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-[#30AD8F] rounded-full" />
                                        <h2 className="text-xl font-bold text-gray-900">Location</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Office Address</p>
                                            <p className="text-sm font-bold text-slate-700 leading-snug">
                                                {[college.collegeAddress?.street, college.collegeAddress?.city, college.collegeAddress?.district]
                                                    .filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        {college.google_map_url && college.google_map_url.trim().startsWith('<iframe') ? (
                                            <div 
                                                className="w-full h-48 rounded-2xl overflow-hidden border border-slate-100 shadow-inner [&>iframe]:w-full [&>iframe]:h-full"
                                                dangerouslySetInnerHTML={{ __html: college.google_map_url }}
                                            />
                                        ) : college.google_map_url && (
                                            <a 
                                                href={college.google_map_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 p-3 bg-[#30AD8F]/10 text-[#30AD8F] rounded-xl font-bold text-sm hover:bg-[#30AD8F] hover:text-white transition-all"
                                            >
                                                <MapPin size={16} />
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Team Members */}
                                {college.collegeMembers?.length > 0 && (
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                            <h2 className="text-xl font-bold text-gray-900">Key Members</h2>
                                        </div>
                                        <div className="space-y-6">
                                            {college.collegeMembers.map((member, idx) => (
                                                <div key={idx} className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{member.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Image Gallery Snippet */}
                                {college.collegeGallery?.length > 0 && (
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                                            <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {college.collegeGallery.slice(0, 4).map((img, idx) => (
                                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100">
                                                    <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

export default ViewCollegeModal
