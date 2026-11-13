import { useEffect, useRef, useState } from 'react'

const numberFormatter = new Intl.NumberFormat('en-US')

function getInitialCount(value) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return prefersReducedMotion || typeof IntersectionObserver === 'undefined'
    ? value
    : 0
}

export default function AnimatedCounter({ value, suffix = '' }) {
  const counterRef = useRef(null)
  const [count, setCount] = useState(() => getInitialCount(value))

  useEffect(() => {
    const element = counterRef.current
    if (!element) return

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    let frameId
    let startTime
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      const animate = (timestamp) => {
        if (startTime === undefined) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / 1200, 1)
        const easedProgress = 1 - (1 - progress) ** 3
        setCount(Math.round(value * easedProgress))
        if (progress < 1) frameId = requestAnimationFrame(animate)
      }

      frameId = requestAnimationFrame(animate)
    }, { threshold: 0.35 })

    observer.observe(element)
    return () => {
      observer.disconnect()
      if (frameId !== undefined) cancelAnimationFrame(frameId)
    }
  }, [value])

  const finalValue = `${numberFormatter.format(value)}${suffix}`

  return (
    <span ref={counterRef}>
      <span aria-hidden="true">{numberFormatter.format(count)}{suffix}</span>
      <span className="sr-only">{finalValue}</span>
    </span>
  )
}
