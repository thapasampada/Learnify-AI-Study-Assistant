import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import Flashcard from '../../components/flashcards/Flashcard'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const navButtonClasses = `inline-flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-900 disabled:active:scale-100 ${focusRing}`

const secondaryButtonClasses = `inline-flex items-center justify-center h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`

const dangerButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const spinnerClasses =
  'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'

const FlashcardPage = () => {

  const { id: documentId } = useParams()
  const [flashcardSet, setFlashcardSet] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchFlashcards = async () => {
    setLoading(true)
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId)
      setFlashcardSet(response.data[0] || null)
      setFlashcards(response.data[0]?.cards || [])
      setCurrentCardIndex(0)
    } catch (error) {
      toast.error('Failed to fetch flashcards.')
      console.error('Error while fetching flashcards: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [documentId])

  const handleGenerateFlashcards = async () => {
    setGenerating(true)
    try {
      await aiService.generateFlashcards(documentId)
      toast.success('Flashcards generated successfully!')
      fetchFlashcards()
    } catch (error) {
      toast.error('Failed to generate flashcards.')
      console.error('Error while generating flashcards: ', error)
    } finally {
      setGenerating(false)
    }
  }

  // Record that the card on screen was reviewed (silent, no toast per flip)
  const handleReview = async () => {
    const currentCard = flashcards[currentCardIndex]
    if (!currentCard) return

    try {
      await flashcardService.reviewFlashcard(currentCard._id)
    } catch (error) {
      console.error('Error reviewing flashcard:', error)
    }
  }

  const handleNextCard = () => {
    handleReview()
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
  }

  const handlePrevCard = () => {
    handleReview()
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    )
  }

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId)
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      )
    } catch (error) {
      toast.error('Failed to update star status.')
      console.error(error)
    }
  }

  const handleDeleteFlashcardSet = async () => {
    if (!flashcardSet) return

    setDeleting(true)
    try {
      await flashcardService.deleteFlashcardSet(flashcardSet._id)
      toast.success('Flashcard set deleted successfully!')
      setIsDeleteModalOpen(false)
      fetchFlashcards()
    } catch (error) {
      toast.error('Failed to delete flashcard set.')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const renderFlashcardContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center py-16'>
          <Spinner />
        </div>
      )
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title='No Flashcards Yet'
          description='Generate flashcards from your document to start learning.'
        />
      )
    }

    const currentCard = flashcards[currentCardIndex]

    return (
      <div className='space-y-6'>
        <div className='w-full max-w-2xl mx-auto'>
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className='flex items-center justify-center gap-4'>
          <button
            onClick={handlePrevCard}
            disabled={flashcards.length <= 1}
            className={navButtonClasses}
          >
            <ChevronLeft className='w-4 h-4' strokeWidth={2.5} />
            Previous
          </button>
          <span className='px-4 py-2 rounded-xl bg-emerald-50 text-sm font-semibold text-slate-900'>
            {currentCardIndex + 1}
            <span className='mx-1 text-slate-400'>/</span>
            {flashcards.length}
          </span>
          <button
            onClick={handleNextCard}
            disabled={flashcards.length <= 1}
            className={navButtonClasses}
          >
            Next
            <ChevronRight className='w-4 h-4' strokeWidth={2.5} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
      <div className='flex'>
        <Link
          to={`/documents/${documentId}`}
          className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 rounded-lg transition-colors duration-200 ${focusRing}`}
        >
          <ArrowLeft className='w-4 h-4' strokeWidth={2} />
          Back to Document
        </Link>
      </div>

      <PageHeader title='Flashcards'>
        <div className='flex items-center gap-2'>
          {!loading &&
            (flashcards.length > 0 ? (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleting}
                className={dangerButtonClasses}
              >
                <Trash2 className='w-4 h-4' strokeWidth={2} />
                Delete Set
              </button>
            ) : (
              <button
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className={primaryButtonClasses}
              >
                {generating ? (
                  <>
                    <div className={spinnerClasses} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4' strokeWidth={2.5} />
                    Generate Flashcards
                  </>
                )}
              </button>
            ))}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title='Confirm Delete Flashcard Set'
      >
        <div className='space-y-5'>
          <p className='text-sm text-slate-500'>
            Are you sure you want to delete all flashcards for this document?
            This action cannot be undone.
          </p>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className={dangerButtonClasses}
            >
              {deleting ? (
                <>
                  <div className={spinnerClasses} />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FlashcardPage