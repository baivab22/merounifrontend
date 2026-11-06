'use server'

import { cookies } from 'next/headers'

const API_URL = `${process.env.baseUrl}/short-term-courses`

const getAuthHeaders = async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        const refreshToken = cookieStore.get('refreshToken')?.value || cookieStore.get('x-refresh-token')?.value
        const headers = {}
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        if (refreshToken) {
            headers['x-refresh-token'] = refreshToken
        }
        const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ')
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader
        }
        return headers
    } catch (e) {
        return {}
    }
}

export async function fetchPublicSkillCourses({ q = '', page = 1, limit = 20, price = '', duration = '', location = '', type = '' } = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...(q && { q, search: q, title: q }),
            ...(price && { price }),
            ...(duration && { duration }),
            ...(location && { location }),
            ...(type && { course_type: type })
        })

        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}?${queryParams}`, {
            cache: 'no-store',
            headers
        })

        if (!response.ok) {
            if (response.status === 404) return { items: [], pagination: {} };
            throw new Error('Failed to fetch skill courses')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching public skill courses:', error)
        return { items: [], pagination: {} }
    }
}

export async function fetchSkillCourseBySlug(slug) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/slug/${slug}`, {
            cache: 'no-store',
            headers
        })

        if (!response.ok) {
            if (response.status === 404) return null
            if (response.status === 403) {
                try {
                    return await response.json()
                } catch {
                    return null
                }
            }
            throw new Error('Failed to fetch skill course details')
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching skill course details:', error)
        return null
    }
}
