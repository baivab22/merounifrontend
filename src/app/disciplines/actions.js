'use server'

export const fetchDisciplines = async (search = '', page = 1) => {
  try {
    const url = new URL(`${process.env.baseUrl}/discipline`)
    if (search) url.searchParams.append('q', search)
    url.searchParams.append('page', page)
    url.searchParams.append('limit', 24)

    const response = await fetch(url.toString(), { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch disciplines')
    return data
  } catch (error) {
    console.error('Error fetching disciplines:', error)
    throw error
  }
}
