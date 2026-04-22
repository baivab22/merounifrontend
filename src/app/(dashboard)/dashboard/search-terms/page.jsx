'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import useAdminPermission from '@/hooks/useAdminPermission'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import SearchInput from '@/ui/molecules/SearchInput'
import { Button } from '@/ui/shadcn/button'
import { Loader2, RefreshCw, Search, Trash2 } from 'lucide-react'

export default function SearchTermsPage() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const { requireAdmin } = useAdminPermission()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authFetch(`${process.env.baseUrl}/search-terms/admin`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(
          err.message || err.error || 'Failed to load search terms'
        )
      }
      const body = await res.json()
      setItems(Array.isArray(body.data) ? body.data : [])
    } catch (e) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to load search terms',
        variant: 'destructive'
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    setHeading('Search Terms')
    load()
    return () => setHeading(null)
  }, [setHeading, load])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter((row) => (row.term || '').toLowerCase().includes(q))
  }, [items, searchQuery])

  const confirmDelete = async () => {
    if (deleteId == null) return
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/search-terms/admin/${deleteId}`,
        {
          method: 'DELETE'
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || 'Delete failed')
      }
      toast({ title: 'Removed', description: 'Search term deleted.' })
      setDeleteId(null)
      await load()
    } catch (e) {
      toast({
        title: 'Error',
        description: e.message || 'Could not delete',
        variant: 'destructive'
      })
      throw e
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <p className='text-sm text-gray-600 max-w-xl'>
          Terms are recorded from site search, ordered by popularity (highest
          count first). Remove entries you no longer want in analytics or
          suggestions.
        </p>
        <div className='flex items-center gap-2 shrink-0'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => load()}
            disabled={loading}
            className='gap-2'
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3'>
          <div className='flex items-center gap-2 text-gray-700 font-medium text-sm'>
            <Search className='w-4 h-4 text-[#387cae]' />
            <span>Filter terms</span>
          </div>
          <div className='flex-1 max-w-md'>
            <SearchInput
              placeholder='Search in list…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 text-gray-500 gap-3'>
            <Loader2 className='w-8 h-8 animate-spin text-[#387cae]' />
            <p className='text-sm'>Loading search terms…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-16 text-center text-gray-500 text-sm'>
            {items.length === 0
              ? 'No search terms recorded yet.'
              : 'No terms match your filter.'}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                  <th className='px-4 py-3 w-14'>#</th>
                  <th className='px-4 py-3'>Term</th>
                  <th className='px-4 py-3 w-32 text-right'>Searches</th>
                  <th className='px-4 py-3 w-40 hidden md:table-cell'>
                    Updated
                  </th>
                  <th className='px-4 py-3 w-24 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    className='border-b border-gray-50 hover:bg-gray-50/80 transition-colors'
                  >
                    <td className='px-4 py-3 text-gray-400 tabular-nums'>
                      {idx + 1}
                    </td>
                    <td
                      className='px-4 py-3 font-medium text-gray-900 max-w-md truncate'
                      title={row.term}
                    >
                      {row.term}
                    </td>
                    <td className='px-4 py-3 text-right tabular-nums text-gray-700'>
                      {row.count}
                    </td>
                    <td className='px-4 py-3 text-gray-500 hidden md:table-cell text-xs'>
                      {row.updatedAt
                        ? new Date(row.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <button
                        type='button'
                        title='Delete term'
                        onClick={() => requireAdmin(() => setDeleteId(row.id))}
                        className='inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title='Delete search term?'
        message='This removes the term from stored search analytics. It may be logged again if users search for it later.'
        confirmText='Delete'
      />
    </div>
  )
}
