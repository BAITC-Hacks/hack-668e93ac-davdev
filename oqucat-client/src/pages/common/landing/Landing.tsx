import CustomCursor from '@/components/custom-cursor/CustomCursor'
import VasyaDisplay from '@/components/vasya/VasyaDisplay'

import LandingScrollProgress from './LandingScrollProgress'
import LandingSmoothScroll from './LandingSmoothScroll'

const Landing = () => (
  <main className="portfolio-landing relative min-h-dvh w-full select-none overflow-hidden">
    <div className="absolute inset-0">
      <VasyaDisplay />
    </div>
    <LandingSmoothScroll />
    <LandingScrollProgress />
    <CustomCursor />
  </main>
)

export default Landing
