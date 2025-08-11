import { useRef } from 'react'
import './App.css'
import EnvelopeAnimation from './components/EnvelopeAnimation'

function App() {
  const envelopeAnimationRef = useRef(null)

  const handleReset = () => {
    if (envelopeAnimationRef.current) {
      envelopeAnimationRef.current.resetSequence()
    }
  }

  return (
    <div className="envelope-app">
      <div className="stage">
        <EnvelopeAnimation ref={envelopeAnimationRef} />
        
        <div className="controls">
          <button className="replay" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default App
