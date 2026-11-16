import { useState, useEffect } from 'react'
import flashcardService from '../../services/flashcardService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard'
import toast from 'react-hot-toast'

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets()
        setFlashcardSets(response.data)
      } catch (error) {
        toast.error('Failed to fetch flashcards')
        console.error('Error while fetching flashcards, ', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFlashcardSets()
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center py-16'>
          <Spinner />
        </div>
      )
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You haven't generated any flashcards yet. Go to a document to generate flashcards."
        />
      )
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
      <PageHeader title='All Flashcard Sets' />
      {renderContent()}
    </div>
  )
}

export default FlashcardsListPage