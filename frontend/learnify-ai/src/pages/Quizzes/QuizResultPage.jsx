import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import quizService from '../../services/quizService'
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BookOpen } from 'lucide-react'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9DA6]/40'

const getScoreColor = (score) => {
  if (score >= 80) return 'from-[#4F9DA6] to-[#3D7F87]'
  if (score >= 60) return 'from-[#D9A441] to-[#C48A2A]'
  return 'from-[#B8543F] to-[#A24733]'
}

const getScoreMessage = (score) => {
  if (score >= 90) return 'Outstanding!'
  if (score >= 80) return 'Great job!'
  if (score >= 70) return 'Good work!'
  if (score >= 60) return 'Not bad!'
  return 'Keep practicing!'
}

const QuizResultPage = () => {

  const { quizId } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId)
        setResults(data)
      } catch (error) {
        toast.error('Failed to fetch quiz results.')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [quizId])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Spinner />
      </div>
    )
  }

  if (!results || !results.data || !results.data.quiz) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] px-6'>
        <div className='text-center py-12 px-8 bg-white border border-[#DCE6E8] rounded-2xl'>
          <p className='text-sm text-[#647278]'>Quiz results not found.</p>
        </div>
      </div>
    )
  }

  const { quiz, results: detailedResults = [] } = results.data
  const score = quiz.score
  const totalQuestions = detailedResults.length
  const correctAnswers = detailedResults.filter((r) => r.isCorrect).length
  const incorrectAnswers = totalQuestions - correctAnswers

  // The quiz may come back with the document populated as `document` or `documentId`
  const documentId = quiz.document?._id || quiz.documentId?._id || quiz.documentId
  const documentLink = documentId ? `/documents/${documentId}` : '/documents'

  return (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
      {/* Back Button */}
      <div className='flex'>
        <Link
          to={documentLink}
          className={`inline-flex items-center gap-2 text-sm font-semibold text-[#647278] hover:text-[#2A3439] rounded-lg transition-colors duration-200 ${focusRing}`}
        >
          <ArrowLeft className='w-4 h-4' strokeWidth={2} />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || 'Quiz'} Results`} />

      {/* Score Card */}
      <div className='bg-white border border-[#DCE6E8] rounded-2xl shadow-lg shadow-[#4F9DA6]/10 overflow-hidden'>
        <div className='flex flex-col items-center text-center gap-5 p-8 bg-linear-to-br from-[#F7FAFB] to-[#EAF2F2]'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] shadow-lg shadow-[#4F9DA6]/25'>
            <Trophy className='w-8 h-8 text-white' strokeWidth={2} />
          </div>

          <div>
            <p className='text-xs font-semibold text-[#647278] uppercase tracking-wide mb-1'>
              Your Score
            </p>
            <div className={`text-5xl sm:text-6xl font-bold bg-linear-to-r bg-clip-text text-transparent ${
              getScoreColor(score)
            }`}>
              {score}%
            </div>
            <p className='text-base font-medium text-[#2A3439] mt-1'>
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
            <div className='inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCE6E8]'>
              <Target className='w-4 h-4 text-[#647278]' strokeWidth={2} />
              <span className='text-sm font-semibold text-[#2A3439]'>
                {totalQuestions} Total
              </span>
            </div>
            <div className='inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF6F0] border border-[#CFE3D5]'>
              <CheckCircle2 className='w-4 h-4 text-[#4E8A62]' strokeWidth={2} />
              <span className='text-sm font-semibold text-[#3E7050]'>
                {correctAnswers} Correct
              </span>
            </div>
            <div className='inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FBEEEC] border border-[#F0CFC8]'>
              <XCircle className='w-4 h-4 text-[#B8543F]' strokeWidth={2} />
              <span className='text-sm font-semibold text-[#B8543F]'>
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <BookOpen className='w-5 h-5 text-[#3D7F87]' strokeWidth={2} />
          <h3 className='text-lg font-semibold text-[#2A3439]'>Detailed Review</h3>
        </div>

        {detailedResults.map((result, index) => {
          const userAnswerIndex = result.options.findIndex((opt) => opt === result.selectedAnswer)
          // correctAnswer is usually the option text, but can also arrive as "O1" / "01" style
          const correctAnswerIndex = /^[O0]\d+$/i.test(result.correctAnswer)
            ? parseInt(result.correctAnswer.substring(1)) - 1
            : result.options.findIndex((opt) => opt === result.correctAnswer)
          const isCorrect = result.isCorrect

          return (
            <div
              key={index}
              className='bg-white border border-[#DCE6E8] rounded-2xl p-5 sm:p-6 space-y-4'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='mb-2'>
                    <span className='inline-flex px-2.5 py-1 rounded-lg bg-[#EAF2F2] text-xs font-semibold text-[#3D7F87]'>
                      Question {index + 1}
                    </span>
                  </div>
                  <h4 className='text-base font-semibold text-[#2A3439] leading-snug'>
                    {result.question}
                  </h4>
                </div>
                <div className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-xl ${
                  isCorrect ? 'bg-[#EEF6F0]' : 'bg-[#FBEEEC]'
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className='w-5 h-5 text-[#4E8A62]' strokeWidth={2.5} />
                  ) : (
                    <XCircle className='w-5 h-5 text-[#B8543F]' strokeWidth={2.5} />
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                {result.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === correctAnswerIndex
                  const isUserAnswer = optIndex === userAnswerIndex
                  const isWrongAnswer = isUserAnswer && !isCorrect

                  return (
                    <div
                      key={optIndex}
                      className={`p-3.5 border-2 rounded-xl ${
                        isCorrectOption
                          ? 'border-[#8FB89A] bg-[#EEF6F0]'
                          : isWrongAnswer
                          ? 'border-[#E3A99C] bg-[#FBEEEC]'
                          : 'border-[#EAF2F2] bg-white'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <span className={`text-sm font-medium ${
                          isCorrectOption
                            ? 'text-[#3E7050]'
                            : isWrongAnswer
                            ? 'text-[#B8543F]'
                            : 'text-[#647278]'
                        }`}>
                          {option}
                        </span>
                        <div className='flex items-center gap-2 shrink-0'>
                          {isCorrectOption && (
                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-[#3E7050]'>
                              <CheckCircle2 className='w-3.5 h-3.5' strokeWidth={2.5} />
                              Correct
                            </span>
                          )}
                          {isWrongAnswer && (
                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-[#B8543F]'>
                              <XCircle className='w-3.5 h-3.5' strokeWidth={2.5} />
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className='p-4 rounded-xl bg-[#F7FAFB] border border-[#DCE6E8]'>
                  <div className='flex items-start gap-3'>
                    <div className='flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-[#EAF2F2]'>
                      <BookOpen className='w-4 h-4 text-[#3D7F87]' strokeWidth={2} />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-[#3D7F87] uppercase tracking-wide mb-1'>
                        Explanation
                      </p>
                      <p className='text-sm text-[#647278] leading-relaxed'>
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Button */}
      <div className='flex justify-center pt-2'>
        <Link
          to={documentLink}
          className='group relative inline-flex items-center justify-center h-11 px-6 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4F9DA6]/20'
        >
          <span className='relative z-10 inline-flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' strokeWidth={2.5} />
            Return to Document
          </span>
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700'
          />
        </Link>
      </div>
    </div>
  )
}

export default QuizResultPage