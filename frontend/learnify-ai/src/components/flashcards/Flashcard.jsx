import { useState, useEffect } from 'react'
import { Star, RotateCcw } from 'lucide-react'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

// How long the flip animation takes (also used to delay the answer swap)
const FLIP_DURATION_MS = 500

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  // The answer shown on the back. It lags behind the real answer while the card
  // flips back to the question, so the old answer stays visible during the animation
  // instead of changing to the next card's answer mid-flip.
  const [backAnswer, setBackAnswer] = useState(flashcard.answer)
  const [currentCardId, setCurrentCardId] = useState(flashcard._id)

  // When a different card arrives: if the answer side is showing, flip back to the question.
  // If the question side is already showing, the back is hidden so it can update right away.
  if (currentCardId !== flashcard._id) {
    setCurrentCardId(flashcard._id)
    if (isFlipped) {
      setIsFlipped(false)
    } else {
      setBackAnswer(flashcard.answer)
    }
  }

  // After the flip-back finishes, swap in the new card's answer
  useEffect(() => {
    if (backAnswer === flashcard.answer) return
    const timer = setTimeout(() => setBackAnswer(flashcard.answer), FLIP_DURATION_MS)
    return () => clearTimeout(timer)
  }, [backAnswer, flashcard.answer])

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  // Flip with Enter/Space, but only when the card itself is focused
  // (not when a key is pressed on the star button inside it)
  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Flashcard answer. Press Enter to see the question.' : 'Flashcard question. Press Enter to reveal the answer.'}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-72 sm:h-80 cursor-pointer select-none rounded-2xl ${focusRing}`}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform ease-in-out motion-reduce:transition-none"
        style={{
          transitionDuration: `${FLIP_DURATION_MS}ms`,
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of the card (Question) */}
        <div
          aria-hidden={isFlipped}
          className="absolute inset-0 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-emerald-500/10 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="flex flex-col h-full p-6">
            {/* Star Button */}
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(flashcard._id)
                }}
                tabIndex={isFlipped ? -1 : 0}
                aria-label={flashcard.isStarred ? 'Unstar flashcard' : 'Star flashcard'}
                aria-pressed={!!flashcard.isStarred}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${focusRing} ${
                  flashcard.isStarred
                    ? 'bg-amber-50 text-amber-500'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-emerald-50'
                }`}
              >
                <Star
                  className="w-5 h-5"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Question Content */}
            <div className="flex flex-1 min-h-0 overflow-y-auto py-3">
              <p className="m-auto text-lg sm:text-xl font-medium text-slate-900 text-center leading-relaxed">
                {flashcard.question}
              </p>
            </div>

            {/* Flip Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Click to reveal answer</span>
            </div>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div
          aria-hidden={!isFlipped}
          className="absolute inset-0 flex flex-col p-6 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/25 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Star Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar(flashcard._id)
              }}
              tabIndex={isFlipped ? 0 : -1}
              aria-label={flashcard.isStarred ? 'Unstar flashcard' : 'Star flashcard'}
              aria-pressed={!!flashcard.isStarred}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                flashcard.isStarred
                  ? 'bg-white/25 text-amber-200'
                  : 'text-white/80 hover:text-white hover:bg-white/20'
              }`}
            >
              <Star
                className="w-5 h-5"
                strokeWidth={2}
                fill={flashcard.isStarred ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Answer Content */}
          <div className="flex flex-1 min-h-0 overflow-y-auto py-3">
            <p className="m-auto text-base sm:text-lg font-medium text-white text-center leading-relaxed">
              {backAnswer}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/80">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard