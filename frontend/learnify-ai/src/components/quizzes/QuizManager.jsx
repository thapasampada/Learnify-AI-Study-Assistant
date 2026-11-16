import { useState, useEffect } from "react"
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import quizService from '../../services/quizService'
import aiService from '../../services/aiService'
import Spinner from '../common/Spinner'
import Modal from '../common/Modal'
import QuizCard from './QuizCard'
import EmptyState from "../common/EmptyState"

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const secondaryButtonClasses = `inline-flex items-center justify-center h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`

const dangerButtonClasses =
  'inline-flex items-center justify-center h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const spinnerClasses =
  'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'

const QuizManager = ({ documentId }) => {

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [numQuestions, setNumQuestions] = useState(5)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const data = await quizService.getQuizzesForDocument(documentId)
      setQuizzes(data.data)
    } catch (error) {
      toast.error('Failed to fetch quizzes.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (documentId) {
      fetchQuizzes()
    }
  }, [documentId])

  const handleGenerateQuiz = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await aiService.generateQuiz(documentId, { numQuestions })
      toast.success('Quiz generated successfully!')
      setIsGenerateModalOpen(false)
      fetchQuizzes()
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return
    setDeleting(true)
    try {
      // Make sure this matches the function name exported by quizService
      await quizService.deleteQuiz(selectedQuiz._id)
      toast.success(`'${selectedQuiz.title || 'Quiz'}' deleted.`)
      setIsDeleteModalOpen(false)
      setSelectedQuiz(null)
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id))
    } catch (error) {
      toast.error(error.message || 'Failed to delete quiz.')
    } finally {
      setDeleting(false)
    }
  }

  const renderQuizContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Yet"
          description="Generate a quiz from your document to test your knowledge."
          buttonText="Generate Quiz"
          onActionClick={() => setIsGenerateModalOpen(true)}
        />
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className={primaryButtonClasses}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Generate Quiz
        </button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-5">
          <div>
            <label
              htmlFor="numQuestions"
              className="block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2"
            >
              Number of Questions
            </label>
            <input
              id="numQuestions"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              required
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
            <button type="submit" disabled={generating} className={primaryButtonClasses}>
              {generating ? (
                <>
                  <div className={spinnerClasses} />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            Are you sure you want to delete the quiz:{' '}
            <span className="font-semibold text-slate-900">
              {selectedQuiz?.title || 'this quiz'}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className={dangerButtonClasses}
            >
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <div className={spinnerClasses} />
                  Deleting...
                </span>
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

export default QuizManager