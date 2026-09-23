import Lenis from 'lenis'
import { useEffect } from 'react'

const LENIS_OPTIONS = {
  duration: 1.6,
  easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
  gestureOrientation: 'vertical' as const,
  orientation: 'vertical' as const,
  smoothWheel: true,
  touchMultiplier: 2,
  wheelMultiplier: 1,
}

const LandingSmoothScroll = () => {
  useEffect(() => {
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => globalThis.cancelAnimationFrame(0)
    }

    const lenis = new Lenis(LENIS_OPTIONS)
    let animationFrameId = 0
    let initialScrollFrameId = 0
    const getOffset = () => {
      const nav = document.querySelector<HTMLElement>('.portfolio-nav')

      return -(nav?.offsetHeight ?? 52) - 28
    }
    const getTarget = (hash: string) =>
      hash === '#top'
        ? document.body
        : document.querySelector<HTMLElement>(
            `#${globalThis.CSS.escape(hash.slice(1))}`
          )
    const scrollToHash = (hash: string) => {
      const target = getTarget(hash)

      if (target) {
        lenis.scrollTo(target, { offset: hash === '#top' ? 0 : getOffset() })
      }
    }
    const raf = (time: number) => {
      lenis.raf(time)
      animationFrameId = globalThis.requestAnimationFrame(raf)
    }
    const handleAnchorClick = (event: MouseEvent) => {
      const { target } = event

      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]')
      const hash = anchor?.getAttribute('href')

      if (!hash || hash === '#' || !getTarget(hash)) {
        return
      }

      event.preventDefault()
      globalThis.history.pushState(null, '', hash)
      scrollToHash(hash)
    }
    const handlePopState = () =>
      scrollToHash(globalThis.location.hash || '#top')

    animationFrameId = globalThis.requestAnimationFrame(raf)
    document.addEventListener('click', handleAnchorClick)
    globalThis.addEventListener('popstate', handlePopState)

    if (globalThis.location.hash) {
      initialScrollFrameId = globalThis.requestAnimationFrame(() =>
        scrollToHash(globalThis.location.hash)
      )
    } else {
      lenis.scrollTo(0, { immediate: true })
    }

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      globalThis.removeEventListener('popstate', handlePopState)
      globalThis.cancelAnimationFrame(animationFrameId)
      globalThis.cancelAnimationFrame(initialScrollFrameId)
      lenis.destroy()
    }
  }, [])

  return null
}

export default LandingSmoothScroll
