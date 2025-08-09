import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
// Using external SVG files from /public for back, front, flap

function App() {
  const [isOpening, setIsOpening] = useState(false)
  const [isLetterOut, setIsLetterOut] = useState(false)
  const [isLetterAbove, setIsLetterAbove] = useState(false)
  const timeoutsRef = useRef([])

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

    // Timings aligned with CSS transitions:
    // flap: 1.2s, letter slide: 1.1s
    const flapOpenMs = 1200
    const letterSlideMs = 1100

    // Begin sliding the letter out shortly after the flap is open
    timeoutsRef.current.push(setTimeout(() => setIsLetterOut(true), flapOpenMs + 100))

    // When slide-out completes, bring the letter above all layers
    timeoutsRef.current.push(
      setTimeout(() => setIsLetterAbove(true), flapOpenMs + 100 + letterSlideMs + 100)
    )
  }

  function resetSequence() {
    // Clear running timers
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Ensure letter goes back inside and is not above
    setIsLetterAbove(false)
    setIsLetterOut(false)

    // After the letter slides back in, close the flap
    const letterSlideMs = 1100
    timeoutsRef.current.push(setTimeout(() => setIsOpening(false), letterSlideMs + 100))
  }

  return (
    <div className="envelope-app">
      <div className="stage">
        <div className="envelope-scene">
          <div className={`envelope`}
               onClick={startSequence}
               aria-label="Animated envelope revealing content (click to open)">
            {/* Back SVG */}
            <img className="env-back-svg" src="/env-back.svg" alt="" />

            <motion.div
              className="letter"
              aria-hidden={!isOpening}
              style={{
                '--letter-y': '0px',
                zIndex: isLetterAbove ? 7 : (isLetterOut ? 4 : 2),
                boxShadow: isLetterOut
                  ? '0 16px 26px var(--env-shadow-strong), inset 0 0 0 1px rgba(0,0,0,0.04)'
                  : '0 8px 14px var(--env-shadow), inset 0 0 0 1px rgba(0,0,0,0.04)'
              }}
              animate={{ '--letter-y': isLetterOut ? '-180px' : '0px' }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
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
          </div>
        </div>

        <div className="controls">
          <button className="replay" onClick={resetSequence}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default App
