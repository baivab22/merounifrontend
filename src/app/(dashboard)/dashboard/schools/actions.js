import { authFetch } from '@/app/utils/authFetch'

export async function createOrUpdateSchool(data) {
  const response = await authFetch(
    `${process.env.baseUrl}/school`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong")
  }

  return result
}

export async function saveDraft(data) {
  const response = await authFetch(
    `${process.env.baseUrl}/school/save-as-draft`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save draft')
  }

  return response.json()
}

export const fetchUniversities = async (searchQuery = '') => {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/university${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch universities')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getProgramsByUniversity = async (universityIds) => {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/program?universityIds=${universityIds.join(',')}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch programs')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const fetchAllDegrees = async () => {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/degree?limit=1000&status=all`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch degrees')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const fetchBoards = async (searchQuery = '') => {
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/board${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch boards')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getStreamsByBoards = async (boardIds) => {
  if (!boardIds || boardIds.length === 0) return []
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/stream?board_ids=${boardIds.join(',')}&limit=1000`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch streams')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getProgramsByStreams = async (streamIds) => {
  if (!streamIds || streamIds.length === 0) return []
  try {
    const response = await authFetch(
      `${process.env.baseUrl}/program?stream_ids=${streamIds.join(',')}&limit=1000`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch programs')
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error(error)
    throw error
  }
}

