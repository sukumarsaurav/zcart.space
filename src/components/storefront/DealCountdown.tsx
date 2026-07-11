'use client'

import { useState, useEffect } from 'react'

export default function DealCountdown({ targetDate, isDark = false }: { targetDate: string, isDark?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(targetDate)
      const difference = end.getTime() - now.getTime()
      
      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted || isExpired) return <div style={{ height: 24 }} /> // placeholder

  const pad = (num: number) => num.toString().padStart(2, '0')

  const boxBg = isDark ? '#fff' : 'var(--color-primary-500)'
  const boxColor = isDark ? '#111' : '#fff'
  const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textColor }}>
      <span>Ends in</span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {timeLeft.days > 0 && (
          <>
            <span style={{ background: boxBg, color: boxColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{pad(timeLeft.days)}d</span>
            <span>:</span>
          </>
        )}
        <span style={{ background: boxBg, color: boxColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{pad(timeLeft.hours)}</span>
        <span>:</span>
        <span style={{ background: boxBg, color: boxColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{pad(timeLeft.minutes)}</span>
        <span>:</span>
        <span style={{ background: boxBg, color: boxColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  )
}
