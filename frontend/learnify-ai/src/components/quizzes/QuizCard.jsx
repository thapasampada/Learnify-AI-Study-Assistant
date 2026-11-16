import { Link } from 'react-router-dom'
import { Play, BarChart2, Trash2, Award } from 'lucide-react'
import moment from 'moment'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const QuizCard = ({ quiz, onDelete }) => {
  const isCompleted = quiz?.userAnswers?.length > 0
  const questionCount = quiz?.questions?.length ?? 0

  return (
    <div className='group relative flex flex-col bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200'>
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(quiz)
        }}
        aria-label='Delete quiz'
        className={`absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 ${focusRing}`}
      >
        <Trash2 className='w-4 h-4' strokeWidth={2} />
      </button>

      <div className='flex-1 p-5 space-y-4'>
        {/* Status Badge */}
        <div className='flex'>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-50 border border-slate-200 text-slate-500'
            }`}
          >
            <Award className='w-3.5 h-3.5' strokeWidth={2.5} />
            <span className='text-xs font-semibold'>
              {isCompleted ? `Score: ${quiz.score}` : 'Not attempted'}
            </span>
          </div>
        </div>

        <div>
          <h3
            className='text-base font-semibold text-slate-900 truncate'
            title={quiz.title}
          >
            {quiz.title ||
              `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
          </h3>
          <p className='text-xs text-slate-500 mt-0.5'>
            Created {moment(quiz.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        {/* Quiz Info */}
        <div className='pt-4 border-t border-slate-100'>
          <div className='flex items-center'>
            <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500'>
              {questionCount}{" "}
              {questionCount === 1 ? "Question" : "Questions"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className='p-5 pt-0'>
        {isCompleted ? (
          <Link
            to={`/quizzes/${quiz._id}/results`}
            className={`inline-flex w-full items-center justify-center gap-2 h-10 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:border-emerald-500 hover:text-emerald-600 active:scale-[0.98] transition-all duration-200 ${focusRing}`}
          >
            <BarChart2 className='w-4 h-4' strokeWidth={2.5} />
            View Results
          </Link>
        ) : (
          <Link
            to={`/quizzes/${quiz._id}`}
            className='inline-flex w-full items-center justify-center gap-2 h-10 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20'
          >
            <Play className='w-4 h-4' strokeWidth={2.5} />
            Start Quiz
          </Link>
        )}
      </div>
    </div>
  )
}

export default QuizCard