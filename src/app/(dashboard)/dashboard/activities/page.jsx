'use client'
import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import Table from '@/ui/shadcn/DataTable'
import SearchInput from '@/ui/molecules/SearchInput'
import { createColumns } from './columns'
import ActorFilter from './ActorFilter'

export default function ActivitiesManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  const [actors, setActors] = useState([])
  const [selectedActors, setSelectedActors] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })

  useEffect(() => {
    setHeading('Activity Logs')
    
    // Auto-select current admin to show their logs first
    let currentUserId = null;
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const payloadStr = atob(token.split('.')[1])
        const tokenData = JSON.parse(payloadStr)
        if (tokenData?.data?.id) {
          currentUserId = tokenData.data.id
          setSelectedActors([currentUserId])
        }
      }
    } catch(err) {
      console.warn('Could not decode admin token', err)
    }

    fetchActors()
    
    // Defer initial log loading to selectedActors effect unless we found no user
    if (!currentUserId) {
       loadLogs(1, '', [])
    }
    
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false)
      if (selectedActors.length === 0) return // Skip if we handled standard load in first useEffect
    }
    loadLogs(1, searchQuery, selectedActors)
  }, [selectedActors])

  const fetchActors = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return
      
      // Fetch admins and editors separately to satisfy backend validation
      const urlAdmin = `${process.env.baseUrl}/users?role=admin&limit=100`
      const urlEditor = `${process.env.baseUrl}/users?role=editor&limit=100`
      
      const [resAdmin, resEditor] = await Promise.all([
        authFetch(urlAdmin, { headers: { Authorization: `Bearer ${token}` } }),
        authFetch(urlEditor, { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      let allItems = []
      if (resAdmin.ok) {
        const data = await resAdmin.json()
        if (data.items) allItems = [...allItems, ...data.items]
      }
      if (resEditor.ok) {
        const data = await resEditor.json()
        if (data.items) allItems = [...allItems, ...data.items]
      }

      if (allItems.length > 0) {
        const formattedActors = allItems.map(user => {
          let roles = user.roles || {}
          if (typeof roles === 'string') {
             try { roles = JSON.parse(roles) } catch(e) {}
          }
          const roleInfo = roles.admin ? 'Admin' : (roles.editor ? 'Editor' : 'User')
          const firstName = user.firstName || user.first_name || ''
          const lastName = user.lastName || user.last_name || ''
          return {
            id: user.id,
            label: `${firstName} ${lastName}`.trim() || user.email,
            roleInfo,
            email: user.email
          }
        })
        setActors(formattedActors)
      }
    } catch (err) {
      console.error('Error fetching actors:', err)
    }
  }

  const loadLogs = async (page = 1, query = searchQuery, userIds = selectedActors) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('Token not found')
      setLoading(true)

      let url = `${process.env.baseUrl}/activity-logs?page=${page}`
      if (query) url += `&q=${encodeURIComponent(query)}`
      if (userIds && userIds.length > 0) {
        url += `&userIds=${userIds.join(',')}`
      }

      const response = await authFetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.data || [])
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            total: data.pagination.totalItems
          })
        }
      } else {
        if (response.status === 403) {
           throw new Error('You do not have permission to view activity logs.')
        }
        throw new Error('Failed to fetch activity logs')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load activity logs',
        variant: 'destructive'
      })
      console.error('Error loading activity logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)

    const timeoutId = setTimeout(() => {
      loadLogs(1, value, selectedActors)
    }, 400)
    setSearchTimeout(timeoutId)
  }

  const columns = useMemo(() => createColumns(), [])

  return (
    <div className='w-full'>
      {/* Sticky Header with Filters */}
      <div className='sticky top-0 z-30 bg-[#F7F8FA] py-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder='Search activities, resource, or endpoints...'
            className='max-w-md w-full'
          />
          <div className='flex gap-2 shrink-0 items-center justify-end w-full sm:w-auto mt-4 sm:mt-0'>
            <ActorFilter 
              actors={actors}
              selectedActors={selectedActors}
              onChange={setSelectedActors}
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-md shadow-sm border overflow-hidden mt-4'>
        <Table
          loading={loading}
          data={logs}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) => loadLogs(newPage, searchQuery, selectedActors)}
          showSearch={false}
        />
      </div>
    </div>
  )
}
