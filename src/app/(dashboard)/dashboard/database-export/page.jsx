'use client'

import { usePageHeading } from '@/contexts/PageHeadingContext'
import { Button } from '@/ui/shadcn/button'
import {
    Database,
    Download,
    Clock,
    FileText,
    RefreshCw,
    HardDrive,
    Calendar
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { exportDatabase } from '../../../actions/databaseActions'
import { authFetch } from '@/app/utils/authFetch'
import dayjs from 'dayjs'
import Table from '@/ui/shadcn/DataTable'


export default function DatabaseExportPage() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()
    const [isExporting, setIsExporting] = useState(false)
    const [history, setHistory] = useState([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [dbStatus, setDbStatus] = useState(null)
    const [isStatusLoading, setIsStatusLoading] = useState(true)

    // Backup Configuration State
    const [backupInterval, setBackupInterval] = useState('Weekly')
    const [isSavingConfig, setIsSavingConfig] = useState(false)

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })

    useEffect(() => {
        setHeading('Database Export')
        fetchDownloadHistory()
        fetchDbStatus()
        fetchBackupConfig()
        return () => setHeading(null)
    }, [setHeading])

    const fetchBackupConfig = async () => {
        try {
            const response = await authFetch(`${process.env.baseUrl}/config/database_backup_interval`)
            if (response.ok) {
                const data = await response.json()
                if (data.config?.value) {
                    setBackupInterval(data.config.value)
                }
            }
        } catch (error) {
            console.error('Error fetching backup config:', error)
        }
    }

    const handleSaveConfig = async (newInterval) => {
        setBackupInterval(newInterval)
        setIsSavingConfig(true)
        try {
            const response = await authFetch(`${process.env.baseUrl}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'database_backup_interval',
                    value: newInterval
                })
            })

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Backup interval updated to ${newInterval}`
                })
            } else {
                throw new Error('Failed to update configuration')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        } finally {
            setIsSavingConfig(false)
        }
    }

    const fetchDbStatus = async () => {
        setIsStatusLoading(true)
        try {
            const response = await authFetch(`${process.env.baseUrl}/database/status`)
            const data = await response.json()
            setDbStatus(data.data || data)
        } catch (error) {
            console.error('Error fetching DB status:', error)
        } finally {
            setIsStatusLoading(false)
        }
    }

    const fetchDownloadHistory = async () => {
        setIsLoadingHistory(true)
        try {
            const response = await authFetch(`${process.env.baseUrl}/database/downloads`)
            const data = await response.json()
            const historyData = Array.isArray(data.data) ? data.data : []
            setHistory(historyData)
            setPagination({
                currentPage: 1,
                totalPages: Math.ceil(historyData.length / 10) || 1,
                total: historyData.length
            })
        } catch (error) {
            console.error('Error fetching history:', error)
            toast({
                title: 'Error',
                description: 'Failed to load export history',
                variant: 'destructive'
            })
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            await exportDatabase()
            toast({
                title: 'Success',
                description: 'Backup generated and downloaded successfully'
            })
            setTimeout(fetchDownloadHistory, 1500)
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Export failed',
                variant: 'destructive'
            })
        } finally {
            setIsExporting(false)
        }
    }

    const paginatedData = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * 10
        const endIndex = startIndex + 10
        return history.slice(startIndex, endIndex)
    }, [history, pagination.currentPage])

    const columns = useMemo(() => [
        {
            header: 'File Name',
            accessorKey: 'fileName',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex gap-3">
                        <div className="shrink-0 w-9 h-9 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#387cae] group-hover:border-blue-100 transition-all">
                            <FileText size={16} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-semibold text-slate-700 mb-0.5 line-clamp-1 max-w-[250px]" title={item.fileName}>
                                {item.fileName}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#387cae] uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded leading-none border border-blue-100/50">
                                    {item.downloadType || 'SQL'}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">Production Backup</span>
                            </div>
                        </div>
                    </div>
                )
            }
        },

        {
            header: 'Exact Date & Time',
            accessorKey: 'createdAtDate',
            cell: ({ row }) => (
                <div className="flex flex-col items-start">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {dayjs(row.original.createdAt).format('MMM D, YYYY')}
                    </p>
                    <p className="text-xs text-slate-400 font-medium tabular-nums">
                        {dayjs(row.original.createdAt).format('hh:mm:ss A')}
                    </p>
                </div>
            )
        }
    ], [])

    return (
        <div className="w-full space-y-6 p-4">
            
            {/* Backup Configuration Card */}
            <div className="bg-white p-6 rounded-md border shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#387cae]">
                    <Clock size={20} />
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Backend Backup Strategy</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-slate-600 font-medium">
                            Configure how often the database should be automatically backed up, zipped, and emailed to the administrator.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 min-w-[360px]">
                        
                        {/* Download Now Button */}
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold gap-2 h-10 px-4 whitespace-nowrap shadow-none border border-gray-200"
                        >
                            {isExporting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isExporting ? 'Generating...' : 'Download Backup Now'}
                        </Button>

                        {/* Interval Select */}
                        <div className="relative w-full flex items-center gap-2">
                            <select
                                value={backupInterval}
                                onChange={(e) => handleSaveConfig(e.target.value)}
                                disabled={isSavingConfig}
                                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#387cae] focus:border-[#387cae] outline-none transition-all disabled:opacity-50"
                            >
                                <option value="Daily">Daily (at midnight)</option>
                                <option value="Weekly">Weekly (every Sunday)</option>
                                <option value="Monthly">Monthly (1st of month)</option>
                            </select>
                            {isSavingConfig && (
                                <RefreshCw className="w-4 h-4 animate-spin text-[#387cae] absolute right-8" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid - Only Used Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`bg-white p-4 rounded-md border border-indigo-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md max-w-xs`}>
                    <div className={`w-10 h-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600`}>
                        <HardDrive size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Used Storage</p>
                        <p className="text-sm font-bold text-slate-700">
                            {isStatusLoading ? <span className="inline-block w-16 h-4 bg-slate-50 animate-pulse rounded"></span> : (dbStatus?.size || '---')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Export History Logs</h3>
                </div>

                <div className="bg-white rounded-md shadow-sm border overflow-hidden">
                    <Table
                        loading={isLoadingHistory}
                        data={paginatedData}
                        columns={columns}
                        pagination={pagination}
                        onPageChange={(p) => setPagination(prev => ({ ...prev, currentPage: p }))}
                        showSearch={false}
                        emptyContent={
                            <div className="flex flex-col items-center gap-3 py-10">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                    <Database size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">No export logs found.</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
