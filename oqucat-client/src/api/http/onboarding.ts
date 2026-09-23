import type { SelectableUserRole, UserRole } from '@/types/UserRole'

import { apiRequest, host } from '.'

interface SelectRoleResponse {
  role: UserRole
}

export const selectRole = (role: SelectableUserRole) =>
  apiRequest<SelectRoleResponse>(host.post('onboarding/role', { role }), {
    success: 'common:onboarding.success',
  })
