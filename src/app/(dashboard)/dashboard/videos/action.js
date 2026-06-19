import { authFetch } from '@/app/utils/authFetch'

const url = `${process.env.baseUrl}/video`

export async function fetchVideos(page = 1, limit = 1000, search = '', category_id = '') {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (search) {
      params.set('q', search)
    }
    if (category_id) {
      params.set('category_id', category_id)
    }

    const response = await authFetch(`${url}?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch videos')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching videos:', error)
    throw error
  }
}

export async function getVideoBySlug(slug) {
  try {
    const response = await fetch(
      `${url}/slug/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.item || data.video || data
  } catch (error) {
    console.error('Error fetching video details:', error)
    return null
  }
}

export async function createVideo(data) {
  try {
    const response = await authFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create video')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating video:', error)
    throw error
  }
}

export async function updateVideo(videoId, data) {
  try {
    const response = await authFetch(`${url}/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update video')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating video:', error)
    throw error
  }
}

export async function deleteVideo(videoId) {
  try {
    const response = await authFetch(`${url}/${videoId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete video')
    }
    return await response.json()
  } catch (error) {
    console.error('Error deleting video:', error)
    throw error
  }
}
