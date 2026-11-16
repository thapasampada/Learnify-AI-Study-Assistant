import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9DA6]/40'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4F9DA6]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const secondaryButtonClasses = `inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border-2 border-[#DCE6E8] bg-white text-sm font-semibold text-[#2A3439] hover:border-[#4F9DA6] hover:text-[#3D7F87] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#DCE6E8] disabled:hover:text-[#2A3439] disabled:active:scale-100 ${focusRing}`

const QuizTakePage = () => {

  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId)
        setQuiz(response.data)
      } catch (error) {
        toast.error('Failed to fetch quiz.')
        console.log('Error while fetching quiz: ', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestions = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length === 0) {
      toast.error('Please answer at least one question before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const formattedAnswers = Object.keys(selectedAnswers).map((questionId) => {
        const question = quiz.questions.find((q) => q._id === questionId)
        const questionIndex = quiz.questions.findIndex((q) => q._id === questionId)
        const optionIndex = selectedAnswers[questionId]
        const selectedAnswer = question.options[optionIndex]
        return { questionIndex, selectedAnswer }
      })

      await quizService.submitQuiz(quizId, formattedAnswers)
      toast.success('Quiz submitted successfully!')
      navigate(`/quizzes/${quizId}/results`)
    } catch (error) {
      // Backend errors arrive as { error: '...' }, service fallbacks as { message: '...' }
      toast.error(error.error || error.message || 'Failed to submit quiz.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Spinner />
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] px-6'>
        <div className='text-center py-12 px-8 bg-white border border-[#DCE6E8] rounded-2xl'>
          <p className='text-sm text-[#647278]'>Quiz not found or has no questions.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
      <PageHeader title={quiz.title || 'Take Quiz'} />

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-semibold text-[#2A3439]'>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className='text-xs font-medium text-[#647278]'>
            {answeredCount} answered
          </span>
        </div>
        <div
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
          aria-valuenow={currentQuestionIndex + 1}
          className='h-2 bg-[#EAF2F2] rounded-full overflow-hidden'
        >
          <div
            className='h-full bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] rounded-full transition-all duration-300 ease-out'
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className='bg-white border border-[#DCE6E8] rounded-2xl shadow-lg shadow-[#4F9DA6]/10 p-6 sm:p-8'>
        <div className='flex items-center gap-2 mb-4'>
          <div className='w-2 h-2 rounded-full bg-[#4F9DA6]' />
          <span className='text-xs font-semibold text-[#3D7F87] uppercase tracking-wide'>
            Question {currentQuestionIndex + 1}
          </span>
        </div>

        <h3 className='text-lg sm:text-xl font-semibold text-[#2A3439] leading-snug mb-6'>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className='space-y-3'>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === index
            return (
              <label
                key={index}
                className={`group relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-[#4F9DA6] bg-[#EAF2F2]/60 shadow-md shadow-[#4F9DA6]/10'
                    : 'border-[#DCE6E8] bg-white hover:border-[#4F9DA6]/60 hover:bg-[#F7FAFB]'
                }`}
              >
                <input
                  type='radio'
                  name={`question-${currentQuestion._id}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => handleOptionChange(currentQuestion._id, index)}
                  className='sr-only peer'
                />

                {/* Custom Radio Button */}
                <div
                  className={`flex items-center justify-center shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-[#4F9DA6]/20 ${
                    isSelected
                      ? 'border-[#4F9DA6] bg-[#4F9DA6]'
                      : 'border-[#9CB0B4] bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className='flex items-center justify-center'>
                      <div className='w-2 h-2 rounded-full bg-white' />
                    </div>
                  )}
                </div>

                {/* Option Text */}
                <span
                  className={`flex-1 text-sm font-medium transition-colors duration-200 ${
                    isSelected ? 'text-[#2A3439]' : 'text-[#647278]'
                  }`}
                >
                  {option}
                </span>

                {/* Selected Checkmark */}
                {isSelected && (
                  <CheckCircle2
                    className='w-5 h-5 text-[#4F9DA6] shrink-0'
                    strokeWidth={2.5}
                  />
                )}
              </label>
            )
          })}
        </div>

        {/* Navigate Buttons */}
        <div className='flex items-center justify-between gap-3 mt-8 pt-6 border-t border-[#EAF2F2]'>
          <button
            onClick={handlePreviousQuestions}
            disabled={currentQuestionIndex === 0 || submitting}
            className={secondaryButtonClasses}
          >
            <ChevronLeft className='w-4 h-4' strokeWidth={2.5} />
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className={`group relative overflow-hidden ${primaryButtonClasses}`}
            >
              <span className='relative z-10 inline-flex items-center gap-2'>
                {submitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='w-4 h-4' strokeWidth={2.5} />
                    Submit Quiz
                  </>
                )}
              </span>
              <div
                aria-hidden='true'
                className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700'
              />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={submitting}
              className={primaryButtonClasses}
            >
              Next
              <ChevronRight className='w-4 h-4' strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className='flex flex-wrap items-center justify-center gap-2 mt-6'>
          {quiz.questions.map((question, index) => {
            const isAnsweredQuestion = question._id in selectedAnswers
            const isCurrent = index === currentQuestionIndex

            return (
              <button
                key={question._id || index}
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={submitting}
                aria-label={`Go to question ${index + 1}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`w-9 h-9 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${focusRing} ${
                  isCurrent
                    ? 'border-[#4F9DA6] bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] text-white shadow-md shadow-[#4F9DA6]/25'
                    : isAnsweredQuestion
                    ? 'border-[#4F9DA6]/40 bg-[#EAF2F2] text-[#3D7F87]'
                    : 'border-[#DCE6E8] bg-white text-[#647278] hover:border-[#4F9DA6]/60'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuizTakePage