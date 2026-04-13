'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Width milestones (%) and the delay (ms) after click to reach each one.
// Asymptotic: fast at first, slowing down — never reaches 100% on its own.
const MILESTONES: [number, number][] = [
  [25,    0],
  [50,  250],
  [70,  600],
  [82, 1500],
  [88, 4000],
]

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth]     = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [visible, setVisible] = useState(false)
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([])
  const pending = useRef(false)

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function start() {
    clearTimers()
    pending.current = true
    setOpacity(1)
    setWidth(0)
    setVisible(true)
    MILESTONES.forEach(([target, delay]) => {
      timers.current.push(setTimeout(() => setWidth(target), delay))
    })
  }

  function finish() {
    clearTimers()
    pending.current = false
    setWidth(100)
    // brief pause at 100%, then fade out
    timers.current.push(setTimeout(() => setOpacity(0), 150))
    timers.current.push(setTimeout(() => { setVisible(false); setWidth(0); setOpacity(1) }, 500))
  }

  // pathname change = navigation committed → complete the bar
  useEffect(() => {
    if (!pending.current) return
    finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // intercept link clicks to detect navigation start
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (
        href.startsWith('http') ||
        href.startsWith('#')    ||
        anchor.hasAttribute('download') ||
        href === pathname
      ) return
      start()
    }
    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-primary/20">
      <div
        className="h-full bg-primary"
        style={{
          width: `${width}%`,
          opacity,
          transition: 'width 350ms ease-out, opacity 300ms ease',
        }}
      />
    </div>
  )
}
