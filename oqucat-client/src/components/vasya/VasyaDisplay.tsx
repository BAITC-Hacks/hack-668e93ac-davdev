/* oxlint-disable react/no-multi-comp, react/no-unknown-property -- R3F scene helper and props belong with the display. */

import { Canvas, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

import { useThemeColors } from '@/utils/useThemeColors'

import { useVasyaVoiceAssistant } from './useVasyaVoiceAssistant'
import Vasya, { type VasyaHandle } from './Vasya'

const CAMERA = { fov: 35, position: [0, 100, 300] as const }
const DIRECTIONAL_LIGHT_POSITION = [200, 300, 200] as const
const BACKLIGHT_POSITION = [0, 60, -100] as const
const BACKDROP_SCALE = [0.8, 1.25, 1] as const
const BACKDROP_GEOMETRY_ARGS = [88, 64] as const

const VasyaBackdrop = ({ color }: { color: string }) => {
  const { viewport } = useThree()
  const position = useMemo(
    () => [0, -40 - viewport.height * 0.12, -45] as const,
    [viewport.height]
  )

  return (
    <mesh position={position} scale={BACKDROP_SCALE}>
      <circleGeometry args={BACKDROP_GEOMETRY_ARGS} />
      <meshBasicMaterial
        color={color}
        depthWrite={false}
        opacity={0.2}
        transparent
      />
    </mesh>
  )
}

const VasyaDisplay = () => {
  const vasya = useRef<VasyaHandle>(null)
  const { foreground } = useThemeColors()
  const { start } = useVasyaVoiceAssistant(vasya)
  const backlightColor = foreground === '#000' ? '#fff' : '#000'

  return (
    <Canvas camera={CAMERA}>
      <ambientLight intensity={2} />
      <directionalLight position={DIRECTIONAL_LIGHT_POSITION} intensity={2} />
      <pointLight
        color={backlightColor}
        decay={2}
        distance={300}
        intensity={45}
        position={BACKLIGHT_POSITION}
      />
      <VasyaBackdrop color={backlightColor} />
      <Vasya ref={vasya} onActivate={start} />
    </Canvas>
  )
}

export default VasyaDisplay
