
export async function getExams(page = 1, search = '', examType = '', levelId = '', universityId = '', discipline = '', categoryId = '') {
  try {
    const url = new URL(`${process.env.baseUrl}/exam`)
    url.searchParams.append('page', page)
    url.searchParams.append('limit', 15)

    if (search) url.searchParams.append('q', search)
    if (examType) url.searchParams.append('examType', examType)
    if (levelId) url.searchParams.append('levelId', levelId)
    if (universityId) url.searchParams.append('universityId', universityId)
    if (discipline) url.searchParams.append('discipline', discipline)
    if (categoryId) url.searchParams.append('categoryId', categoryId)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exams')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching exams:', error)
    throw error
  }
}

export const fetchFaculties = async () => {
  try {
    const response = await fetch(`${process.env.baseUrl}/faculty`)
    if (!response.ok) throw new Error('Failed to fetch faculties')
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return []
  }
}

export const fetchLevels = async () => {
  try {
    const response = await fetch(`${process.env.baseUrl}/level`)
    if (!response.ok) throw new Error('Failed to fetch levels')
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching levels:', error)
    return []
  }
}

export const fetchUniversities = async () => {
  try {
    const response = await fetch(`${process.env.baseUrl}/university`)
    if (!response.ok) throw new Error('Failed to fetch universities')
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching universities:', error)
    return []
  }
}

export const fetchExamCategories = async () => {
  try {
    const response = await fetch(`${process.env.baseUrl}/category?type=EXAM`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export const getExamBySlug = async (slugs) => {
  try {
    const response = await fetch(`${process.env.baseUrl}/exam/${slugs}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    })
    if (!response.ok) throw new Error('Failed to fetch exam')
    const data = await response.json()
    return data.item || data
  } catch (error) {
    console.error('Error fetching exam by slug:', error)
    return null
  }
}
