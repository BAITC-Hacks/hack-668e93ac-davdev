import type { ComponentType, JSX } from 'react'

export interface TabItem {
  id: string
  icon: ComponentType
  component: JSX.Element | null
}
