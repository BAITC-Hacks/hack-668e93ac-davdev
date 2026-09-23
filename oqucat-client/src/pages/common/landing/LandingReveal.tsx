import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface LandingRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

const LandingReveal = ({
  children,
  className = '',
  delay = 0,
}: LandingRevealProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

export default LandingReveal
