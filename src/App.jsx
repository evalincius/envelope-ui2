import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
// Using external SVG files from /public for back, front, flap

function App() {
  const [isOpening, setIsOpening] = useState(false)
  const [isLetterOut, setIsLetterOut] = useState(false)
  const [isLetterAbove, setIsLetterAbove] = useState(false)
  const [shouldSlideDown, setShouldSlideDown] = useState(false)
  const [envelopeY, setEnvelopeY] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isReturning, setIsReturning] = useState(false)
  const timeoutsRef = useRef([])
  const slideTriggerRef = useRef(false)
  const envelopeRef = useRef(null)
  const letterRef = useRef(null)

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  function startSequence() {
    // Clear running timers
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Open the flap and reset letter positions
    setIsOpening(true)
    setIsLetterOut(false)
    setIsLetterAbove(false)
    setShouldSlideDown(false)
    setEnvelopeY(0)
    setIsZoomed(false)
    setIsReturning(false)
    slideTriggerRef.current = false

    // Timings aligned with CSS transitions:
    // flap: 1.2s, letter slide: 1.1s
    const flapOpenMs = 1200
    const letterSlideMs = 1100

    // Begin sliding the letter out shortly after the flap is open
    timeoutsRef.current.push(setTimeout(() => setIsLetterOut(true), flapOpenMs + 100))

    // Fallback: if progress-based trigger doesn't fire, start slide ~80% into letter slide
    const fallbackTriggerMs = flapOpenMs + 100 + Math.round(letterSlideMs * 0.8)
    timeoutsRef.current.push(
      setTimeout(() => {
        if (slideTriggerRef.current) return
        slideTriggerRef.current = true
        const rect = letterRef.current ? letterRef.current.getBoundingClientRect() : null
        if (rect) {
          const viewportCenterY = window.innerHeight / 2
          const letterCenterY = rect.top + rect.height / 2
          const deltaY = viewportCenterY - letterCenterY
          setEnvelopeY(deltaY)
        } else {
          setEnvelopeY(160)
        }
        setShouldSlideDown(true)
      }, fallbackTriggerMs)
    )

    // When slide-out completes, bring the letter above all layers
    timeoutsRef.current.push(
      setTimeout(() => setIsLetterAbove(true), flapOpenMs + 100 + letterSlideMs + 100)
    )
  }

  function resetSequence() {
    // Clear running timers
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Reverse in order: 1) Zoom out, 2) Raise envelope, 3) Slide letter in, 4) Close flap & drop layering
    const zoomOutMs = 600 // matches letter transition duration
    const envelopeMoveMs = 800 // matches envelope y transition duration
    const letterSlideMs = 500

    // 1) Zoom out first
    setIsZoomed(false)

    // 2) After zoom-out, raise the envelope back up
    timeoutsRef.current.push(
      setTimeout(() => {
        setShouldSlideDown(false)
        setEnvelopeY(0)
      }, zoomOutMs)
    )

    // 3) After envelope is up, keep letter above flap (but below front) and slide it back in
    timeoutsRef.current.push(
      setTimeout(() => {
        setIsLetterAbove(false)
        setIsReturning(true)
        setIsLetterOut(false)
      }, zoomOutMs + envelopeMoveMs)
    )

    // 4) After letter finishes sliding in, close the flap and reset layering
    timeoutsRef.current.push(
      setTimeout(() => {
        setIsOpening(false)
        setIsReturning(false)
        slideTriggerRef.current = false
      }, zoomOutMs + envelopeMoveMs + letterSlideMs + 100)
    )
  }

  return (
    <div className="envelope-app">
      <div className="stage">
        <div className="envelope-scene">
          <motion.div
               className={`envelope`}
               ref={envelopeRef}
               onClick={startSequence}
               animate={{ y: shouldSlideDown ? envelopeY : 0 }}
               transition={{ y: { duration: 1.8, ease: [0.2, 0.7, 0.2, 1] } }}
               aria-label="Animated envelope revealing content (click to open)">
            {/* Back SVG */}
            <img className="env-back-svg" src="/env-back.svg" alt="" />

            <motion.div
              className="letter"
              ref={letterRef}
              aria-hidden={!isOpening}
              style={{
                '--letter-y': '0px',
                '--letter-scale': 1,
                // While returning, keep above flap (3) but below front (6)
                zIndex: isReturning ? 4 : (isLetterAbove ? 7 : (isLetterOut ? 4 : 2)),
                boxShadow: isLetterOut
                  ? '0 16px 26px var(--env-shadow-strong), inset 0 0 0 1px rgba(0,0,0,0.04)'
                  : '0 8px 14px var(--env-shadow), inset 0 0 0 1px rgba(0,0,0,0.04)'
              }}
              animate={{
                '--letter-y': isLetterOut ? '-290px' : '0px',
                '--letter-scale': isZoomed ? 2.2 : 1
              }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
              onClick={(e) => {
                // Prevent envelope click from restarting
                e.stopPropagation()
                if (isLetterOut || isLetterAbove) {
                  setIsZoomed(true)
                }
              }}
              onUpdate={(latest) => {
                const yValue = latest['--letter-y']
                if (typeof yValue === 'undefined') return
                const numeric = typeof yValue === 'number'
                  ? yValue
                  : parseFloat(String(yValue).replace('px', ''))
                const distancePulled = Math.abs(numeric)
                const totalPullDistance = 290
                const progress = Math.min(distancePulled / totalPullDistance, 1)
                if (progress >= 0.6 && !slideTriggerRef.current) {
                  slideTriggerRef.current = true
                  const rect = letterRef.current ? letterRef.current.getBoundingClientRect() : null
                  if (rect) {
                    const viewportCenterY = window.innerHeight / 2
                    const letterCenterY = rect.top + rect.height / 2
                    const deltaY = viewportCenterY - letterCenterY
                    setEnvelopeY(deltaY)
                  } else {
                    setEnvelopeY(160)
                  }
                  setShouldSlideDown(true)
                }
              }}
            >
              <img className="letter-image" src="/pumba.jpg" alt="Card artwork" />
            </motion.div>

            {/* Front pocket SVG (traditional) */}
            <img className="env-front-svg" src="/env-front.svg" alt="" />

            {/* Flap (outer + inner faces) */}
            <motion.div
              className="flap"
              aria-hidden
              style={{ '--flap-rot': '0deg' }}
              animate={{ '--flap-rot': isOpening ? '-172deg' : '0deg' }}
              transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <motion.img
                className="flap-face flap-outer"
                src="/env-flap-outer.svg"
                alt=""
                initial={false}
                animate={{ opacity: isOpening ? 0 : 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
              <motion.img
                className="flap-face flap-inner"
                src="/env-flap-inner.svg"
                alt=""
                initial={false}
                animate={{ opacity: isOpening ? 1 : 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="controls">
          <button className="replay" onClick={resetSequence}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default App
