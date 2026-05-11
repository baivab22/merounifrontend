import { authFetch } from "../utils/authFetch"

export async function getConsultancies(page = 1, searchQuery = '', courseId = '', city = '', destination = '') {
  try {
    let url = `${process.env.baseUrl}/consultancy?page=${page}&sort=desc&q=${searchQuery}&limit=24`
    if (courseId) {
      url += `&courseId=${courseId}`
    }
    if (city) {
      url += `&city=${city}`
    }
    if (destination) {
      url += `&destination=${destination}`
    }
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch consultancies')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching consultancies:', error)
    throw error
  }
}

export async function getConsultancyLocations() {
  try {
    const response = await fetch(`${process.env.baseUrl}/consultancy/locations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to fetch locations')
    return await response.json()
  } catch (error) {
    console.error('Error fetching locations:', error)
    return { data: { cities: [], destinations: [] } }
  }
}

export async function getConsultancyBySlug(slug) {
  try {
    const response = await fetch(
      `${process.env.baseUrl}/consultancy/${slug}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch consultancy')
    }

    const data = await response.json()
    return data.consultancy || data
  } catch (error) {
    console.error('Error fetching consultancy:', error)
    throw error
  }
}

export async function getCourses() {
  try {
    const response = await fetch(
      `${process.env.baseUrl}/program?limit=100`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw error
  }
}

// check if already applied for consultancy
export async function checkIfConsultancyApplied(consultancyId) {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/consultancy-application/check/${consultancyId}`,
      {
        method: 'GET',
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        error: errorData.error || errorData.message || 'Failed to check status'
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error checking consultancy application status:', error)
    return { error: error.message }
  }
}
