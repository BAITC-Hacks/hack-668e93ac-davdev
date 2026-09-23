import { isAxiosError } from 'axios'

import type { StudentDetails } from '@/types/StudentProfile'

import { host } from '.'

export const getMyStudentProfile = async (signal?: AbortSignal) => {
  try {
    const { data } = await host.get<StudentDetails>('students/me', { signal })
    return data
  } catch (error) {
    if (
      isAxiosError<{ message?: string }>(error) &&
      error.response?.status === 404 &&
      error.response.data?.message === 'student_profile_not_found'
    ) {
      return null
    }
    throw error
  }
}

export const createStudentProfile = async () => {
  const { data } = await host.put<StudentDetails>('students/me', {})
  return data
}
