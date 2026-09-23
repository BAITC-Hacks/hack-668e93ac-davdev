import { isRecord } from './isRecord'

export interface FirebaseServiceAccount {
  projectId?: string
  clientEmail?: string
  privateKey?: string
}

export const parseFirebaseServiceAccount = (
  json: string
): FirebaseServiceAccount => {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch {
    return {}
  }

  if (!isRecord(parsed) || Array.isArray(parsed)) {
    return {}
  }

  const getString = (key: string) => {
    const property = parsed[key]
    return typeof property === 'string' ? property : undefined
  }

  const privateKey = getString('private_key')?.replaceAll(String.raw`\n`, '\n')

  return {
    projectId: getString('project_id'),
    clientEmail: getString('client_email'),
    privateKey,
  }
}
