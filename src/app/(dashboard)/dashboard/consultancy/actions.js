import { authFetch } from '@/app/utils/authFetch'

export async function fetchCourses(searchQuery = '') {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/course?limit=100&q=${encodeURIComponent(searchQuery)}`
    )
    if (!response.ok) throw new Error('Failed to fetch courses')
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export async function createOrUpdateConsultancy(payload) {
  try {
    const response = await authFetch(`${process.env.baseUrl}/consultancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save consultancy')
    }
    return data
  } catch (error) {
    console.error('Error saving consultancy:', error)
    throw error
  }
}

export async function deleteConsultancy(id) {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/consultancy?id=${id}`,
      {
        method: 'DELETE'
      }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete consultancy')
    }
    return data
  } catch (error) {
    console.error('Error deleting consultancy:', error)
    throw error
  }
}

export async function fetchCountries() {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/location/countries`
    )
    if (!response.ok) throw new Error('Failed to fetch countries')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

export async function fetchDistricts() {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/location/districts`
    )
    if (!response.ok) throw new Error('Failed to fetch districts')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching districts:', error)
    return []
  }
}

export async function fetchCities() {
  try {
    const response = await authFetch(`${process.env.baseUrl}/location/cities`)
    if (!response.ok) throw new Error('Failed to fetch cities')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}
