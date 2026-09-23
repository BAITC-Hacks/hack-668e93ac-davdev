import { useEffect, useRef } from 'react'

const LandingScrollProgress = () => {
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight
        const progress =
          scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0

        progressRef.current?.style.setProperty(
          'transform',
          `scaleX(${Math.min(1, Math.max(0, progress))})`
        )
      })
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div
      className="portfolio-scroll-progress"
      ref={progressRef}
      aria-hidden="true"
    />
  )
}

export default LandingScrollProgress
