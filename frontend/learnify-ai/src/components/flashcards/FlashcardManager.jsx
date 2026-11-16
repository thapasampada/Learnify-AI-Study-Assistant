import { useState, useEffect } from 'react'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from 'lucide-react'
import toast from 'react-hot-toast'
import moment from 'moment'

import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'
import Spinner from '../common/Spinner'
import Modal from '../common/Modal'
import Flashcard from './Flashcard'

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const primaryButtonClasses =
    'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const navButtonClasses = `inline-flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-900 disabled:active:scale-100 ${focusRing}`

const spinnerClasses =
    'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, setFlashcardSets] = useState([])
    const [selectedSet, setSelectedSet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [setToDelete, setSetToDelete] = useState(null)

    const fetchFlashcardSets = async () => {
        setLoading(true)
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId)
            setFlashcardSets(response.data)
        } catch (error) {
            console.error('Error fetching flashcard sets:', error)
            toast.error('Failed to fetch flashcard sets. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets()
        }
    }, [documentId])

    const handleGenerateFlashcards = async () => {
        setGenerating(true)
        try {
            await aiService.generateFlashcards(documentId)
            toast.success('Flashcards generated successfully!')
            fetchFlashcardSets()
        } catch (error) {
            console.error('Error generating flashcards:', error)
            toast.error('Failed to generate flashcards. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    // Record that the card currently on screen was reviewed (silent, no toast per flip)
    const handleReview = async () => {
        const currentCard = selectedSet?.cards[currentCardIndex]
        if (!currentCard) return

        try {
            await flashcardService.reviewFlashcard(currentCard._id)
        } catch (error) {
            console.error('Error reviewing flashcard:', error)
        }
    }

    const handleNextCard = () => {
        if (!selectedSet) return
        handleReview()
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length)
    }

    const handlePrevCard = () => {
        if (!selectedSet) return
        setCurrentCardIndex(
            (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
        )
    }

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId)

            const updatedSets = flashcardSets.map((set) => {
                if (set._id !== selectedSet._id) return set

                const updatedCards = set.cards.map((card) =>
                    card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                )
                return { ...set, cards: updatedCards }
            })

            setFlashcardSets(updatedSets)
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id))
        } catch (error) {
            toast.error('Failed to update card status.')
            console.error('Failed to update star status', error)
        }
    }

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation()
        setSetToDelete(set)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!setToDelete) return

        setDeleting(true)
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id)
            toast.success('Flashcard set deleted successfully!')
            setIsDeleteModalOpen(false)
            setSetToDelete(null)
            fetchFlashcardSets()
        } catch (error) {
            console.error('Error deleting flashcard set:', error)
            toast.error('Failed to delete flashcard set. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    const handleSelectSet = (set) => {
        setSelectedSet(set)
        setCurrentCardIndex(0)
    }

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex]

        return (
            <div className='space-y-6'>
                {/* Back Button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 rounded-lg transition-colors duration-200 ${focusRing}`}
                >
                    <ArrowLeft className='w-4 h-4' strokeWidth={2} />
                    Back to Sets
                </button>

                {!currentCard ? (
                    <div className='text-center py-12 bg-white border border-slate-200 rounded-2xl'>
                        <p className='text-sm text-slate-500'>This set has no cards.</p>
                    </div>
                ) : (
                    /* Flashcard Display */
                    <div className='space-y-6'>
                        <div className='w-full max-w-2xl mx-auto'>
                            <Flashcard
                                flashcard={currentCard}
                                onToggleStar={handleToggleStar}
                            />
                        </div>

                        {/* Navigation Buttons */}
                        <div className='flex items-center justify-center gap-4'>
                            <button
                                onClick={handlePrevCard}
                                disabled={selectedSet.cards.length <= 1}
                                className={navButtonClasses}
                            >
                                <ChevronLeft className='w-4 h-4' strokeWidth={2.5} />
                                Previous
                            </button>

                            <div className='px-4 py-2 rounded-xl bg-emerald-50'>
                                <span className='text-sm font-semibold text-slate-900'>
                                    {currentCardIndex + 1}
                                    <span className='mx-1 text-slate-400'>/</span>
                                    {selectedSet.cards.length}
                                </span>
                            </div>

                            <button
                                onClick={handleNextCard}
                                disabled={selectedSet.cards.length <= 1}
                                className={navButtonClasses}
                            >
                                Next
                                <ChevronRight className='w-4 h-4' strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderSetList = () => {
        if (loading) {
            return (
                <div className='flex items-center justify-center py-16'>
                    <Spinner />
                </div>
            )
        }

        if (flashcardSets.length === 0) {
            return (
                <div className='text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-4'>
                        <Brain className='w-8 h-8 text-emerald-600' strokeWidth={2} />
                    </div>
                    <h3 className='text-base font-semibold text-slate-900 mb-1'>
                        No flashcard sets found.
                    </h3>
                    <p className='text-sm text-slate-500 mb-6'>
                        Generate flashcards for this document using the AI Assistant.
                    </p>
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
                                <Sparkles className='w-4 h-4' strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            )
        }

        return (
            <div className='space-y-6'>
                {/* Header with Generate Button */}
                <div className='flex items-center justify-between gap-4'>
                    <div>
                        <h3 className='text-lg font-semibold text-slate-900 tracking-tight'>
                            Your Flashcard Sets
                        </h3>
                        <p className='text-sm text-slate-500'>
                            {flashcardSets.length}{' '}
                            {flashcardSets.length === 1 ? 'set' : 'sets'} available.
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className={`${primaryButtonClasses} shrink-0`}
                    >
                        {generating ? (
                            <>
                                <div className={spinnerClasses} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className='w-4 h-4' strokeWidth={2.5} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            className='group relative bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200'
                        >
                            {/* Set Content (opens the set) */}
                            <div
                                role='button'
                                tabIndex={0}
                                onClick={() => handleSelectSet(set)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        handleSelectSet(set)
                                    }
                                }}
                                className={`flex flex-col p-5 rounded-2xl cursor-pointer ${focusRing}`}
                            >
                                <div className='flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4'>
                                    <Brain className='w-5 h-5 text-white' strokeWidth={2} />
                                </div>

                                <div className='mb-4'>
                                    <h4 className='text-sm font-semibold text-slate-900'>Flashcard Set</h4>
                                    <p className='text-xs text-slate-500 mt-0.5'>
                                        Created on {moment(set.createdAt).format('MMM D, YYYY, h:mm a')}
                                    </p>
                                </div>

                                <div className='pt-4 border-t border-slate-100'>
                                    <div className='flex items-center'>
                                        <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700'>
                                            {set.cards.length}{' '}
                                            {set.cards.length === 1 ? 'card' : 'cards'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                aria-label='Delete flashcard set'
                                className={`absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 ${focusRing}`}
                            >
                                <Trash2 className='w-4 h-4' strokeWidth={2} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='w-full'>
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title='Delete Flashcard Set'
            >
                <div className='space-y-5'>
                    <p className='text-sm text-slate-500'>
                        Are you sure you want to delete this flashcard set? This action cannot be undone.
                    </p>
                    <div className='flex justify-end gap-3'>
                        <button
                            type='button'
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                            className={`h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className='inline-flex items-center justify-center h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'
                        >
                            {deleting ? (
                                <span className='inline-flex items-center gap-2'>
                                    <div className={spinnerClasses} />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete Set'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default FlashcardManager