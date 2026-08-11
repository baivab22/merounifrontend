import { authFetch } from '@/app/utils/authFetch'

export async function getExpertSessions(page = 1, status = 'all', query = '') {
    try {
        let url = `${process.env.baseUrl}/career-guidance?page=${page}`
        if (status !== 'all') {
            url += `&status=${status}`
        }
        if (query) {
            url += `&q=${query}`
        }

        const token = localStorage.getItem('access_token')
        if (!token) throw new Error('No authentication token provided')

        const response = await authFetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            return { items: [], pagination: { currentPage: 1, totalPages: 1, total: 0 } }
        }

        const data = await response.json()

        const pagination = data.pagination || {}
        return {
            items: data.items || data.data || [],
            pagination: {
                currentPage: pagination.currentPage || page,
                totalPages: pagination.totalPages || 1,
                total: pagination.total || pagination.totalCount || (data.items || []).length
            }
        }
    } catch (error) {
        console.error('Error fetching expert sessions:', error)
        throw error
    }
}

export async function updateExpertSession(id, data) {
    try {
        const token = localStorage.getItem('access_token')
        if (!token) throw new Error('No authentication token provided')

        const response = await authFetch(
            `${process.env.baseUrl}/career-guidance/update-status?id=${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            }
        )

        if (!response.ok) {
            throw new Error('Failed to update session status')
        }

        return await response.json()
    } catch (error) {
        console.error('Error updating expert session:', error)
        throw error
    }
}

export async function deleteExpertSession(id) {
    try {
        const token = localStorage.getItem('access_token')
        if (!token) throw new Error('No authentication token provided')

        const response = await authFetch(
            `${process.env.baseUrl}/career-guidance?id=${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to delete session')
        }

        return true
    } catch (error) {
        console.error('Error deleting expert session:', error)
        throw error
    }
}
