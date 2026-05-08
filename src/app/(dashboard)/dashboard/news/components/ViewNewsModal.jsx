import React from 'react';
import HTMLRenderer from '@/ui/HTMLRenderer';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/ui/shadcn/dialog';
import { Button } from '@/ui/shadcn/button';
import { formatDate } from '@/utils/date.util';
import { Calendar, Eye, Globe, MapPin, Newspaper, User } from 'lucide-react';
import Link from 'next/link';

const ViewNewsModal = ({ isOpen, onClose, news, loading }) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-4xl"
        >
            <DialogHeader>
                <DialogTitle>News Details</DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>

            <DialogContent>
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-6 bg-white">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-[#387cae]/10 border-t-[#387cae] rounded-full animate-spin"></div>
                            <Newspaper className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-[#387cae] animate-pulse" />
                        </div>
                        <p className="text-sm font-medium text-[#387cae] uppercase tracking-widest animate-pulse">Fetching Details...</p>
                    </div>
                ) : news ? (
                    <div className="space-y-6 py-2">
                        {/* Featured Image & Title Section */}
                        <div className="relative rounded-2xl overflow-hidden group border shadow-sm h-72">
                            {news.featured_image ? (
                                <img
                                    src={news.featured_image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2">
                                    <Newspaper className="w-16 h-16 stroke-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Featured Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2.5 py-1 bg-[#387cae] rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                                        {news.newsCategory?.title || 'News Update'}
                                    </span>
                                    <span className={`px-2.5 py-1 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border ${news.status === 'published' ? 'bg-emerald-500/50 border-emerald-500/50' : 'bg-amber-500/50 border-amber-500/50'}`}>
                                        {news.status || 'Draft'}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {news.title}
                                </h2>
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Calendar className="w-4 h-4 text-[#387cae]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Posted On</span>
                                    <span className="text-xs font-bold text-gray-700">{formatDate(news.createdAt)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-4 h-4 text-[#387cae]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Author</span>
                                    <span className="text-xs font-bold text-gray-700">Admin</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <MapPin className="w-4 h-4 text-[#387cae]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Institution</span>
                                    <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{news.newsCollege?.name || 'General'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Globe className="w-4 h-4 text-[#387cae]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Visibility</span>
                                    <span className="text-xs font-bold text-gray-700 capitalize">{news.visibility || 'Public'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-8">
                            {news.description && (
                                <div className="relative">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Introduction</h3>
                                    <div className="pl-4 border-l-2 border-[#387cae]/30">
                                        <HTMLRenderer html={news.description} />
                                    </div>
                                </div>
                            )}

                            {news.content && (
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Main Content</h3>
                                    <div className="prose prose-slate max-w-none">
                                        <HTMLRenderer html={news.content} />
                                    </div>
                                </div>
                            )}

                            {news.pdf_file && (
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Attachment (PDF)</h3>
                                    <a
                                        href={news.pdf_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex text-sm font-semibold text-[#387cae] hover:underline"
                                    >
                                        View PDF
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer Area */}
                        <div className="sticky bottom-0 bg-white border-t pt-4 pb-2 mt-8 flex flex-wrap items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                ID: {news.id}
                            </span>
                            <div className="flex gap-3">
                                <Link
                                    href={`/news/${news.slug || news.slugs}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Live Site
                                </Link>
                                <Button
                                    onClick={onClose}
                                    variant="default"
                                    size="sm"
                                    className="bg-[#387cae] hover:bg-[#2d648c] text-[10px] uppercase font-bold tracking-wider rounded-lg px-6"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center h-48 text-gray-400">
                        <Newspaper className="w-12 h-12 mb-4 opacity-10 stroke-1" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">No news data available</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewNewsModal;
