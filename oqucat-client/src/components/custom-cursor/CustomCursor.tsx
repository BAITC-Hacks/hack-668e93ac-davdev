import { useEffect, useRef } from 'react'

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = globalThis.matchMedia('(pointer: fine)')
    const reducedMotion = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    const shouldTrack = media.matches && !reducedMotion.matches

    let frame = 0
    let x = 0
    let y = 0

    const handleMove = (event: MouseEvent) => {
      x = event.clientX
      y = event.clientY

      cancelAnimationFrame(frame)

      frame = requestAnimationFrame(() => {
        cursorRef.current?.style.setProperty(
          'transform',
          `translate3d(${x}px, ${y}px, 0)`
        )
      })
    }

    if (shouldTrack) {
      globalThis.addEventListener('mousemove', handleMove)
    }

    return () => {
      cancelAnimationFrame(frame)
      if (shouldTrack) {
        globalThis.removeEventListener('mousemove', handleMove)
      }
    }
  }, [])

  return <div ref={cursorRef} className="landing-cursor" aria-hidden="true" />
}

export default CustomCursor
