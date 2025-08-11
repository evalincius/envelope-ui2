import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import Envelope from './Envelope'

const EnvelopeAnimation = forwardRef((props, ref) => {
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

  useImperativeHandle(ref, () => ({
    resetSequence
  }))

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
    <div className="envelope-scene">
      <Envelope
        envelopeRef={envelopeRef}
        startSequence={startSequence}
        shouldSlideDown={shouldSlideDown}
        envelopeY={envelopeY}
        isOpening={isOpening}
        letterRef={letterRef}
        isReturning={isReturning}
        isLetterAbove={isLetterAbove}
        isLetterOut={isLetterOut}
        isZoomed={isZoomed}
        setIsZoomed={setIsZoomed}
        setEnvelopeY={setEnvelopeY}
        setShouldSlideDown={setShouldSlideDown}
        slideTriggerRef={slideTriggerRef}
      />
    </div>
  )
})

export default EnvelopeAnimation
