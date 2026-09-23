/* oxlint-disable react/no-unknown-property -- Canvas children use React Three Fiber scene props. */
import { Canvas } from '@react-three/fiber'
import { useCallback } from 'react'

import Vasya from '@/components/vasya/Vasya'
import type {
  VasyaAssistantActivity,
  VasyaHandle,
} from '@/components/vasya/VasyaControls'

const camera = { fov: 35, position: [0, 100, 300] as const }
const light = [200, 300, 200] as const
const CardVasyaAvatar = ({
  activity,
  onActivate,
}: {
  activity: VasyaAssistantActivity
  onActivate: () => void
}) => {
  const bind = useCallback(
    (model: VasyaHandle | null) => {
      model?.setAssistantActivity(activity)
    },
    [activity]
  )
  return (
    <Canvas camera={camera} dpr={[1, 1.5]}>
      <ambientLight intensity={2} />
      <directionalLight position={light} intensity={2} />
      <Vasya ref={bind} onActivate={onActivate} />
    </Canvas>
  )
}
export default CardVasyaAvatar
