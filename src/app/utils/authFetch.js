export const authFetch = async (url, options = {}) => {
  const isServer = typeof window === 'undefined'
  
  try {
    // Get the stored refresh token if in browser
    let refreshToken = !isServer ? localStorage.getItem('refreshToken') : null

    // Attempt to first fetch - if we have a token, include it
    const fetchOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
      }
    }

    if (refreshToken) {
      fetchOptions.headers['x-refresh-token'] = refreshToken
    }

    // First attempt
    let response = await fetch(url, fetchOptions)

    // Handle authentication errors (401, 403) - might indicate invalid session
    if ([401, 403].includes(response.status) && !isServer) {
      const currentRefreshToken = localStorage.getItem('refreshToken')
      
      // If we still have a token, try to let backend handle refresh (backend might set new cookies)
      if (currentRefreshToken) {
        const retryResponse = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options.headers,
            'x-refresh-token': currentRefreshToken
          }
        })

        if (retryResponse.ok) return retryResponse

        if ([401, 403].includes(retryResponse.status)) {
          // Session expired, clear storage
          localStorage.clear()
          console.warn('Session expired - redirection handled by guard or manual login');
          return retryResponse
        }
      }
    }

    // Check for general errors, but let calling code handle them if needed
    // especially if they want to distinguish between 404 and 500
    if (!response.ok) {
        // Optional: you can add generic logging here but getCareer expects to parse JSON
        return response
    }

    return response
  } catch (error) {
    if (!isServer) {
        const isAbortError = error?.name === 'AbortError' || error?.message === 'superseded'
        if (!isAbortError && !error?.message?.includes('401') && !error?.message?.includes('403')) {
          console.log('Auth Fetch Error:', error)
        }
    } else {
        console.error('Server-side Fetch Error:', error.message)
    }
    throw error
  }
}
