import type { ComponentType, JSX } from 'react'

export interface WorkspaceItem {
  id: string
  icon: ComponentType
  component: JSX.Element | null
}
