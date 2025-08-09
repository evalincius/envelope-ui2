import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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
      <style>{`
        :root {
          --env-bg: #f7f5f2;
          --env-paper: #ffffff;
          --env-accent: #c45a63;
          --env-shadow: rgba(0,0,0,0.12);
          --env-shadow-strong: rgba(0,0,0,0.2);
          --ink: #2b2b2b;
          --flap-scale-x: 1.0147; /* normalize flap X scale to match back/front */
          --flap-scale-y: 1.0162; /* normalize flap Y scale to match back/front */
          --flap-rot: 0deg; /* animated via Motion */
          --letter-y: 0px; /* animated via Motion */
        }

        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body {
          margin: 0;
          background: var(--env-bg);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          min-height: 100dvh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Ensure #root fills the width and has no padding that offsets centering */
        #root { width: 100%; max-width: none; margin: 0; padding: 0; display: grid; place-items: center; }

        .envelope-app {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .stage {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          place-content: center;
          grid-auto-flow: row;
          grid-auto-rows: max-content;
          width: 100%;
          padding: 40px 16px;
          gap: 32px;
        }

        .envelope-scene {
          perspective: 1200px;
          width: 360px;
          max-width: 92vw;
        }

        .envelope {
          position: relative;
          width: 520px;
          max-width: 92vw;
          height: 340px;
          cursor: pointer;
        }

        /* Back of envelope (SVG) */
        .env-back-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          filter: drop-shadow(0 10px 24px var(--env-shadow));
        }

        /* Letter sits inside */
        .letter {
          position: absolute;
          left: 50%;
          bottom: 26px;
          /* Keep X-centering in CSS; Y is animated via CSS var */
          transform: translateX(-50%) translateY(var(--letter-y));
          width: 34%;
          height: 72%;
          background: var(--env-paper);
          border-radius: 10px;
          box-shadow: 0 8px 14px var(--env-shadow), inset 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          display: block;
          z-index: 2;
        }

        .letter-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        /* Front pocket (SVG) */
        .env-front-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 6; /* above letter while inside */
          filter: drop-shadow(0 6px 14px var(--env-shadow));
        }

        /* Flap (3D wrapper with two faces) */
        .flap {
          position: absolute;
          left: 0; right: 0; top: 0; height: 62%;
          width: 100%;
          height: 100%;
          transform-origin: 50% 0%;
          /* Keep constant scale in CSS; rotate is animated via CSS var */
          transform: scale(var(--flap-scale-x), var(--flap-scale-y)) rotateX(var(--flap-rot));
          z-index: 3; /* below sliding letter, but above back */
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          will-change: transform;
        }

        .flap-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          pointer-events: none;
          transform: translateZ(0.1px);
          filter: drop-shadow(0 4px 10px var(--env-shadow));
          object-fit: cover;
          object-position: top center;
        }

        .flap-inner { transform: rotateX(180deg) translateZ(0.1px); opacity: 0; }
        .flap-outer { transform: rotate(180deg) translateZ(0.1px); opacity: 1; }

        .controls { display: grid; place-items: center; }
        .replay {
          border: 0; background: #2b2b2b; color: #fff; padding: 10px 14px; border-radius: 10px; cursor: pointer; box-shadow: 0 6px 14px var(--env-shadow);
        }
      `}</style>

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
