'use client'

import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import useAdminPermission from '@/hooks/useAdminPermission'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import {
  Loader2,
  BookOpen,
  Search,
  Plus
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import { arrayMove } from '@dnd-kit/sortable'
import { Button } from '@/ui/shadcn/button'

// New separated components
import MaterialListView from './components/MaterialListView'
import MaterialFormDialog from './components/MaterialFormDialog'

export default function MaterialForm() {
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Category & subcategory filter state
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSubCategory, setFilterSubCategory] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [parentCategories, setParentCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [subLoading, setSubLoading] = useState(false)

  const abortControllerRef = useRef(null)
  const { requireAdmin } = useAdminPermission()

  useEffect(() => {
    setHeading('Material Management')
    loadParentCategories()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    fetchMaterials(filterCategory, filterSubCategory, appliedSearch)
  }, [filterCategory, filterSubCategory, appliedSearch])

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout) }
  }, [searchTimeout])

  const loadParentCategories = async () => {
    try {
      const res = await authFetch(`${process.env.baseUrl}/category?type=MATERIAL&limit=100`)
      const data = await res.json()
      setParentCategories(data.items || [])
    } catch {
      // ignore
    }
  }

  const loadSubCategories = async (parentId) => {
    if (!parentId) { setSubCategories([]); return }
    try {
      setSubLoading(true)
      const res = await authFetch(`${process.env.baseUrl}/sub/${parentId}`)
      const data = await res.json()
      setSubCategories(data.items || data || [])
    } catch {
      setSubCategories([])
    } finally {
      setSubLoading(false)
    }
  }

  const handleFilterCategoryChange = (categoryId) => {
    setFilterCategory(categoryId)
    setFilterSubCategory('')
    setSubCategories([])
    if (categoryId) loadSubCategories(categoryId)
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const id = setTimeout(() => setAppliedSearch(value), 350)
    setSearchTimeout(id)
  }

  const fetchMaterials = async (category = filterCategory, subCategory = filterSubCategory, search = appliedSearch) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('superseded')
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    try {
      let url = `${process.env.baseUrl}/material?limit=1000`
      if (search) url += `&q=${encodeURIComponent(search)}`
      if (subCategory) url += `&category_id=${subCategory}`
      else if (category) url += `&category_id=${category}`

      const response = await authFetch(url, { signal: controller.signal })
      const data = await response.json()

      let items = data.materials || data.items || []
      items.sort((a, b) => {
        const oA = a.order_no ?? Infinity
        const oB = b.order_no ?? Infinity
        return oA !== oB ? oA - oB : b.id - a.id
      })

      setMaterials(items)
    } catch (error) {
      if (error.name === 'AbortError' || controller.signal.aborted) return
      toast.error('Failed to fetch materials')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const handleEdit = (material) => {
    setEditing(true)
    setEditId(material.id)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id) => {
    requireAdmin(() => { setDeleteId(id); setIsDeleteDialogOpen(true) })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      const response = await authFetch(`${process.env.baseUrl}/material?id=${deleteId}`, { method: 'DELETE' })
      const res = await response.json()
      toast.success(res.message || 'Deleted successfully')
      fetchMaterials()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleAddClick = () => {
    setEditing(false)
    setEditId(null)
    setIsFormOpen(true)
  }

  const handleReorder = async (activeId, overId) => {
    const oldIdx = materials.findIndex(m => m.id === activeId)
    const newIdx = materials.findIndex(m => m.id === overId)
    const reordered = arrayMove(materials, oldIdx, newIdx)
    setMaterials(reordered)

    const payload = reordered.map((m, i) => ({ id: m.id, order_no: i + 1 }))
    await saveOrder(payload)
  }

  const handleCategoryReorder = async (activeId, overId) => {
    // Get unique categories in current display order
    const cats = []
    materials.forEach(m => {
      const cId = m.category?.id
      if (cId && !cats.includes(cId)) cats.push(cId)
    })

    const oldIdx = cats.indexOf(activeId)
    const newIdx = cats.indexOf(overId)
    if (oldIdx === -1 || newIdx === -1) return

    const reorderedCats = arrayMove(cats, oldIdx, newIdx)

    // Update local materials state to reflect new category sequence
    const newMaterials = [...materials].sort((a, b) => {
      const idxA = reorderedCats.indexOf(a.category?.id)
      const idxB = reorderedCats.indexOf(b.category?.id)
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
    })
    setMaterials(newMaterials)

    // Save to server
    const payload = reorderedCats.map((id, i) => ({ id, order_no: i + 1 }))
    await saveCategoryOrder(payload)
  }

  const handleSubCategoryReorder = async (activeId, overId, parentId) => {
    // Get subcategories within this parent
    const subs = []
    materials.forEach(m => {
      if (m.category?.id === parentId) {
        const sId = m.sub_category?.id
        if (sId && !subs.includes(sId)) subs.push(sId)
      }
    })

    const oldIdx = subs.indexOf(activeId)
    const newIdx = subs.indexOf(overId)
    if (oldIdx === -1 || newIdx === -1) return

    const reorderedSubs = arrayMove(subs, oldIdx, newIdx)

    // Update local materials state
    const newMaterials = [...materials].sort((a, b) => {
      // First maintain category order
      const catA = a.category?.id
      const catB = b.category?.id
      if (catA !== catB) return 0 // Keep relative to other categories

      // If in same category, sort by new subcategory order
      if (catA === parentId) {
        const idxA = reorderedSubs.indexOf(a.sub_category?.id)
        const idxB = reorderedSubs.indexOf(b.sub_category?.id)
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB)
      }
      return 0
    })
    setMaterials(newMaterials)

    const payload = reorderedSubs.map((id, i) => ({ id, order_no: i + 1 }))
    await saveSubCategoryOrder(payload)
  }

  const saveOrder = async (payload) => {
    try {
      setSaving(true)
      const res = await authFetch(`${process.env.baseUrl}/material/update-order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials: payload })
      })
      if (!res.ok) throw new Error('Failed to save material order')
      toast.success('Material order saved', { autoClose: 1000 })
    } catch (err) {
      toast.error(err.message)
      fetchMaterials()
    } finally {
      setSaving(false)
    }
  }

  const saveCategoryOrder = async (payload) => {
    try {
      setSaving(true)
      const res = await authFetch(`${process.env.baseUrl}/category/update-order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: payload })
      })
      if (!res.ok) throw new Error('Failed to save category order')
      toast.success('Category order saved', { autoClose: 1000 })
    } catch (err) {
      toast.error(err.message)
      fetchMaterials()
    } finally {
      setSaving(false)
    }
  }

  const saveSubCategoryOrder = async (payload) => {
    try {
      setSaving(true)
      const res = await authFetch(`${process.env.baseUrl}/sub/update-order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_categories: payload })
      })
      if (!res.ok) throw new Error('Failed to save subcategory order')
      toast.success('Subcategory order saved', { autoClose: 1000 })
    } catch (err) {
      toast.error(err.message)
      fetchMaterials()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='w-full'>
      <ToastContainer position='bottom-right' />

      {/* ── Sticky Header ───────────────────────────────────────────────────── */}
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <BookOpen size={17} className='text-[#387cae]' />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>Materials</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                {loading
                  ? <span className='inline-flex items-center gap-1'><Loader2 size={10} className='animate-spin' /> Loading…</span>
                  : `${materials.length} total`
                }
                {saving && (
                  <span className='inline-flex items-center gap-1 text-[#387cae]'>
                    · <Loader2 size={10} className='animate-spin' /> Saving order…
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 flex-wrap'>
            <div className='relative shrink-0 sm:w-52'>
              <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder='Search materials…'
                className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => handleFilterCategoryChange(e.target.value)}
              className='h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 transition-all font-medium min-w-[140px]'
            >
              <option value=''>All Categories</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>

            {filterCategory && (
              <select
                value={filterSubCategory}
                onChange={(e) => setFilterSubCategory(e.target.value)}
                disabled={subLoading}
                className='h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 transition-all font-medium min-w-[150px]'
              >
                <option value=''>
                  {subLoading ? 'Loading…' : 'All Subcategories'}
                </option>
                {subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.title}</option>
                ))}
              </select>
            )}

            <Button
              onClick={handleAddClick}
              className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
            >
              <Plus size={15} />
              Add Material
            </Button>
          </div>
        </div>
      </div>

      {/* ── View / Card List ────────────────────────────────────────────────── */}
      <MaterialListView
        materials={materials}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onReorder={handleReorder}
        onCategoryReorder={handleCategoryReorder}
        onSubCategoryReorder={handleSubCategoryReorder}
        onAddClick={handleAddClick}
        searchQuery={searchQuery}
        filterCategory={filterCategory}
      />

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <MaterialFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editing={editing}
        editId={editId}
        authorId={author_id}
        onSuccess={fetchMaterials}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Delete Material'
        message='Are you sure you want to delete this material? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
      />
    </div>
  )
}
