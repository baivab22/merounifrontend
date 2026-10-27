'use server'
import { cookies } from 'next/headers'

// Forwards the signed-in user's token so the API can decide whether a premium
// material's file URL should be unlocked for an approved member.
const getAuthHeaders = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function getMaterials(
  page = 1,
  search = '',
  categoryId = null
) {
  try {
    let url = `${process.env.baseUrl}/materials/list?page=${page}&limit=12`
    if (search) {
      url += `&q=${encodeURIComponent(search)}`
    }
    // Include category_id filter if provided and not 'all'
    if (categoryId && categoryId !== 'all') {
      // Handle unlisted category (materials without category)
      if (categoryId === 'unlisted') {
        url += `&category_id=unlisted`
      } else {
        // Ensure categoryId is a valid number
        url += `&category_id=${categoryId}`
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: await getAuthHeaders(),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Materials')
    }

    const result = await response.json()
    const materials = result.data || result.materials || result.items || []

    return {
      materials,
      pagination: result.pagination || {
        currentPage: page,
        totalPages: 1,
        limit: 12,
        totalCount: materials.length
      }
    }
  } catch (error) {
    console.error('Error fetching materials:', error)
    throw error
  }
}

// Kept for backward compatibility if needed, but getMaterials covers it
export async function getMaterialsByCategory(page, search, categoryId) {
  return getMaterials(page, search, categoryId)
}

export async function getMaterialCategories() {
  try {
    const response = await fetch(
      `${process.env.baseUrl}/category?type=MATERIAL&limit=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Material Categories')
    }
    const data = await response.json()
    const items = data.items || data.data || []
    // Category pages/cards render `name`; the API exposes the same value as `title`.
    return items.map((item) => ({ ...item, name: item.name || item.title }))
  } catch (error) {
    console.error('Error fetching material categories:', error)
    throw error
  }
}
// Fetches classes and subjects
export async function getMaterialHierarchy() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    const response = await fetch(
      `${process.env.baseUrl}/materials?type=MATERIAL&depth=2`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        cache: 'no-store'
      }
    )
    if (!response.ok) throw new Error('Failed to fetch hierarchy')
    const result = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching material hierarchy:', error)
    return []
  }
}

// Fetches materials for a specific subject (topic)
export async function getMaterialsBySubject(subjectId) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    const response = await fetch(
      `${process.env.baseUrl}/materials/topic/${subjectId}`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        cache: 'no-store'
      }
    )
    if (!response.ok) throw new Error('Failed to fetch materials')
    const result = await response.json()
    return result.data || result.materials || result.items || []
  } catch (error) {
    console.error('Error fetching materials by subject:', error)
    return []
  }
}

export async function toggleMaterialHeart(materialId) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    console.log('--- Material Heart Debug ---')
    console.log('Action: toggleMaterialHeart')
    console.log('MaterialId:', materialId)
    console.log('Token Present:', !!token)
    if (token) console.log('Token Preview:', token.substring(0, 10) + '...')
    console.log('---------------------------')

    if (!token) {
      throw new Error('Please login to heart materials')
    }

    const response = await fetch(
      `${process.env.baseUrl}/materials/${materialId}/heart`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      let errorMessage = 'Failed to toggle heart'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // Fallback if response is not JSON
      }
      return { success: false, message: errorMessage }
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Server Action Error:', error)
    throw error
  }
}
