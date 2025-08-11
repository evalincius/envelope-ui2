import { motion } from 'framer-motion'

function Envelope({
  envelopeRef,
  startSequence,
  shouldSlideDown,
  envelopeY,
  isOpening,
  letterRef,
  isReturning,
  isLetterAbove,
  isLetterOut,
  isZoomed,
  setIsZoomed,
  setEnvelopeY,
  setShouldSlideDown,
  slideTriggerRef
}) {
  return (
    <motion.div
      className="envelope"
      ref={envelopeRef}
      onClick={startSequence}
      animate={{ y: shouldSlideDown ? envelopeY : 0 }}
      transition={{ y: { duration: 1.8, ease: [0.2, 0.7, 0.2, 1] } }}
      aria-label="Animated envelope revealing content (click to open)"
    >
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
          '--letter-scale': isZoomed ? 1.8 : 1
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
  )
}

export default Envelope


