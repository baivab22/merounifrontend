'use server'


const API_URL = `${process.env.baseUrl}/skills-based-courses`

export async function fetchSkillsCourses(page = 1, limit = 10, filters = {}) {
    try {
        const { q, status } = filters
        const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit)
        })
        if (q) queryParams.set('q', q)
        if (status && status !== 'all') queryParams.set('status', status)

        const response = await fetch(`${API_URL}?${queryParams}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            if (response.status === 404) return { items: [], pagination: {} }
            throw new Error('Failed to fetch skills courses')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching skills courses:', error)
        return { items: [], pagination: {} }
    }
}
