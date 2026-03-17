'use client'

import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'

const useAdminPermission = () => {
  const { toast } = useToast()
  // Get role from Redux store
  const roleData = useSelector((state) => state.user?.data?.role)

  // Parse and memoize role
  const role = useMemo(() => {
    if (typeof roleData === 'object') return roleData
    try {
      return JSON.parse(roleData)
    } catch {
      return {}
    }
  }, [roleData])

  // Boolean: is user an admin?
  const isAdmin = !!role.admin

  // Guard function: prevents action if not admin
  const requireAdmin = useCallback(
    (
      action,
      fallbackMessage = 'You do not have permission to perform this action.'
    ) => {
      if (!isAdmin) {
        toast({
          title: 'Permission Denied',
          description: fallbackMessage,
          variant: 'destructive'
        })
        return
      }
      action?.()
    },
    [isAdmin]
  )

  return {
    isAdmin,
    role,
    requireAdmin
  }
}

export default useAdminPermission
