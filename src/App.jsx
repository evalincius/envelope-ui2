import { useEffect, useRef, useState } from 'react'
// Using external SVG files from /public for back, front, flap

function App() {
  const [isOpening, setIsOpening] = useState(false)
  const [isLetterOut, setIsLetterOut] = useState(false)
  const [isLetterAbove, setIsLetterAbove] = useState(false)
  const timeoutsRef = useRef([])

  useEffect(() => {
    startSequence()
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  function startSequence() {
    // Clear running timers
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Start by keeping flap open and sliding letter back in
    setIsOpening(true)
    setIsLetterOut(false)
    setIsLetterAbove(false)

    // After letter slides back (1.1s), close the flap
    timeoutsRef.current.push(setTimeout(() => setIsOpening(false), 1100))

    // Re-open the flap after it has visibly closed
    timeoutsRef.current.push(setTimeout(() => setIsOpening(true), 2200))

    // Begin sliding the letter out once flap is opening
    timeoutsRef.current.push(setTimeout(() => setIsLetterOut(true), 3700))

    // When slide-out completes, bring the letter above all layers
    timeoutsRef.current.push(setTimeout(() => setIsLetterAbove(true), 4800))
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
          transform: translateX(-50%);
          width: 34%;
          height: 72%;
          background: var(--env-paper);
          border-radius: 10px;
          box-shadow: 0 8px 14px var(--env-shadow), inset 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          display: block;
          transition: transform 1.1s cubic-bezier(.2,.7,.2,1), opacity .6s ease;
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
          height: 99%;
          transform-origin: 50% 0%;
          transform: scale(var(--flap-scale-x), var(--flap-scale-y)) rotateX(0deg);
          transition: transform 1.2s cubic-bezier(.2,.7,.2,1);
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
          transition: opacity .4s ease;
        }

        .flap-inner { transform: rotateX(180deg) translateZ(0.1px); opacity: 0; }

        /* Crossfade during opening */
        .envelope.is-opening .flap-inner { opacity: 1; }
        .envelope.is-opening .flap-outer { opacity: 0; }

        

        /* Open state */
        .envelope.is-opening .flap { transform: scale(var(--flap-scale-x), var(--flap-scale-y)) rotateX(-172deg); }

        /* Letter slide out */
        .envelope.letter-out .letter {
          transform: translate(-50%, -180px);
          box-shadow: 0 16px 26px var(--env-shadow-strong), inset 0 0 0 1px rgba(0,0,0,0.04);
          z-index: 4; /* above flap, but still below front-bottom */
        }

        /* Once fully out, raise above everything including front-bottom */
        .envelope.letter-front .letter { z-index: 7; }

        .controls { display: grid; place-items: center; }
        .replay {
          border: 0; background: #2b2b2b; color: #fff; padding: 10px 14px; border-radius: 10px; cursor: pointer; box-shadow: 0 6px 14px var(--env-shadow);
        }
      `}</style>

      <div className="stage">
        <div className="envelope-scene">
          <div className={`envelope ${isOpening ? 'is-opening' : ''} ${isLetterOut ? 'letter-out' : ''} ${isLetterAbove ? 'letter-front' : ''}`}
               aria-label="Animated envelope revealing content">
            {/* Back SVG */}
            <img className="env-back-svg" src="/env-back.svg" alt="" />

            <div className="letter" aria-hidden={!isOpening}>
              <img className="letter-image" src="/pumba.jpg" alt="Card artwork" />
            </div>

            {/* Front pocket SVG (traditional) */}
            <img className="env-front-svg" src="/env-front.svg" alt="" />

            {/* Flap (outer + inner faces) */}
            <div className="flap" aria-hidden>
              <img className="flap-face flap-outer" src="/env-flap-outer.svg" alt="" />
              <img className="flap-face flap-inner" src="/env-flap-inner.svg" alt="" />
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="replay" onClick={startSequence}>Replay</button>
        </div>
      </div>
    </div>
  )
}

export default App
