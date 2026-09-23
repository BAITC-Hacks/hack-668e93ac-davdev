import type {
  ApplicationDetails,
  ApplicationInput,
  ApplicationMaterials,
  ProjectApplication,
} from '@/types/ProjectApplication'

import { host } from '.'

export const getMyApplications = async (signal?: AbortSignal) => {
  const { data } = await host.get<ApplicationDetails[]>('applications/mine', {
    signal,
  })
  return data
}

export const createApplication = async (input: ApplicationInput) => {
  const { data } = await host.post<ApplicationDetails>('applications', input)
  return data
}

export const updateApplication = async (
  id: string,
  materials: ApplicationMaterials
) => {
  const { data } = await host.patch<ApplicationDetails>(
    `applications/${encodeURIComponent(id)}`,
    { materials }
  )
  return data
}

export const withdrawApplication = async (id: string) => {
  const { data } = await host.post<ProjectApplication>(
    `applications/${encodeURIComponent(id)}/withdraw`
  )
  return data
}
