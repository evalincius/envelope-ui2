import { useEffect, useRef, useState } from 'react'

function App() {
  const [isOpening, setIsOpening] = useState(false)
  const [isLetterOut, setIsLetterOut] = useState(false)
  const timeoutsRef = useRef([])

  useEffect(() => {
    startSequence()
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  function startSequence() {
    // Reset
    setIsOpening(false)
    setIsLetterOut(false)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Timeline
    // 0ms: start opening
    timeoutsRef.current.push(
      setTimeout(() => setIsOpening(true), 50)
    )
    // 1500ms: letter begins to slide out
    timeoutsRef.current.push(
      setTimeout(() => setIsLetterOut(true), 1500)
    )
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
          width: 100%;
          height: 240px;
        }

        /* Back of envelope */
        .env-back {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #f6efe7, #f0e6db);
          border-radius: 14px;
          box-shadow: 0 8px 20px var(--env-shadow);
        }

        /* Letter sits inside */
        .letter {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          width: 86%;
          height: 70%;
          background: var(--env-paper);
          border-radius: 10px;
          box-shadow: 0 8px 14px var(--env-shadow), inset 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          display: grid;
          grid-template-rows: auto 1fr;
          transition: transform 1.1s cubic-bezier(.2,.7,.2,1), opacity .6s ease;
          z-index: 2;
        }

        .letter-header {
          background: linear-gradient(90deg, #f7f2ee, #fff);
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-weight: 600;
        }
        .letter-body { padding: 16px; font-size: 14px; line-height: 1.5; }

        /* Front of envelope (triangles) to hide letter initially */
        .env-front {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .front-bottom {
          position: absolute;
          left: 0; right: 0; bottom: 0; height: 58%;
          background: linear-gradient(180deg, #efe5d9, #e9decf);
          border-radius: 0 0 14px 14px;
          clip-path: polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%);
          box-shadow: 0 8px 18px var(--env-shadow-strong);
          z-index: 3;
        }

        .flap {
          position: absolute;
          left: 0; right: 0; top: 0; height: 62%;
          transform-origin: 50% 0%;
          transform: rotateX(0deg);
          transition: transform 1.2s cubic-bezier(.2,.7,.2,1);
          z-index: 4;
        }
        .flap-inner {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, #e9dfd1, #e1d5c4);
          border-radius: 14px 14px 0 0;
          clip-path: polygon(50% 100%, 0 0, 100% 0);
          box-shadow: 0 4px 10px var(--env-shadow);
        }

        

        /* Open state */
        .envelope.is-opening .flap { transform: rotateX(-172deg); }

        /* Letter slide out */
        .envelope.letter-out .letter {
          transform: translate(-50%, -120px);
          box-shadow: 0 16px 26px var(--env-shadow-strong), inset 0 0 0 1px rgba(0,0,0,0.04);
          z-index: 6; /* above flap and seal */
        }

        .controls { display: grid; place-items: center; }
        .replay {
          border: 0; background: #2b2b2b; color: #fff; padding: 10px 14px; border-radius: 10px; cursor: pointer; box-shadow: 0 6px 14px var(--env-shadow);
        }
      `}</style>

      <div className="stage">
        <div className="envelope-scene">
          <div className={`envelope ${isOpening ? 'is-opening' : ''} ${isLetterOut ? 'letter-out' : ''}`}
               aria-label="Animated envelope revealing content">
            <div className="env-back" />

            <div className="letter" aria-hidden={!isOpening}>
              <div className="letter-header">You're Invited</div>
              <div className="letter-body">
                A little something inside just for you. Pulling it out now…
              </div>
            </div>

            <div className="env-front">
              <div className="flap"><div className="flap-inner" /></div>
              <div className="front-bottom" />
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
