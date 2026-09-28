import { authFetch } from '@/app/utils/authFetch'

let url = `${process.env.baseUrl}/student-member`

export async function getAllMemberships(params = {}) {
  try {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value)
      }
    })
    const queryString = query.toString()
    const response = await authFetch(
      `${url}${queryString ? `?${queryString}` : ''}`,
      { cache: 'no-store' }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch memberships')
    }
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch memberships')
  }
}

export async function getMembershipById(id) {
  try {
    const response = await authFetch(`${url}/${id}`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch membership')
    }
    return data.membership
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch membership')
  }
}

export async function updateMembershipStatus(id, data) {
  try {
    const response = await authFetch(`${url}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.error || result?.message || 'Failed to update status')
    }
    return result
  } catch (error) {
    throw new Error(error.message || 'Failed to update status')
  }
}

export async function updateMembership(id, data) {
  try {
    const response = await authFetch(`${url}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.error || result?.message || 'Failed to update membership')
    }
    return result
  } catch (error) {
    throw new Error(error.message || 'Failed to update membership')
  }
}

export async function deleteMembership(id) {
  try {
    const response = await authFetch(`${url}/${id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.error || result?.message || 'Failed to delete membership')
    }
    return result
  } catch (error) {
    throw new Error(error.message || 'Failed to delete membership')
  }
}