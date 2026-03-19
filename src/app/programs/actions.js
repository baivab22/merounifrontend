'use server'

export async function getPrograms(page = 1, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: filters.limit ? filters.limit.toString() : '24'
        })

        if (filters.university_ids) {
            queryParams.append('universityIds', filters.university_ids)
        }
        if (filters.level_id) {
            queryParams.append('levelId', filters.level_id)
        }
        if (filters.q) {
            queryParams.append('q', filters.q)
        }

        const url = `${process.env.baseUrl}/program?${queryParams.toString()}`

        const response = await fetch(url, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return {
            programs: data.items || [],
            pagination: data.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalCount: data.items?.length || 0
            }
        }
    } catch (error) {
        console.error('Failed to fetch programs:', error)
        return {
            programs: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 0
            }
        }
    }
}

export async function getProgramBySlug(slug) {
    try {
        const response = await fetch(
            `${process.env.baseUrl}/program/${encodeURIComponent(slug)}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store'
            }
        )
        if (!response.ok) {
            if (response.status === 404) throw new Error('Program not found')
            throw new Error('Failed to fetch program')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching program:', error)
        throw error
    }
}

export async function getUniversities(query = '') {
    try {
        const url = `${process.env.baseUrl}/university?q=${encodeURIComponent(query)}`
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch universities')
        const data = await response.json()
        return data.items || []
    } catch (error) {
        console.error('Error fetching universities:', error)
        return []
    }
}

export async function getLevels(query = '') {
    try {
        const url = `${process.env.baseUrl}/level?q=${encodeURIComponent(query)}`
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch levels')
        const data = await response.json()
        return data.items || []
    } catch (error) {
        console.error('Error fetching levels:', error)
        return []
    }
}
