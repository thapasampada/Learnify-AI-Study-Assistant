import { FileText, Plus } from 'lucide-react'

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className='flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-[#DCE6E8] rounded-2xl'>
      <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF2F2] mb-4'>
        <FileText className='w-8 h-8 text-[#3D7F87]' strokeWidth={2} />
      </div>
      <h3 className='text-base font-semibold text-[#2A3439] mb-1'>{title}</h3>
      <p className='text-sm text-[#647278] max-w-sm mb-6 last:mb-0'>{description}</p>
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className='group relative inline-flex items-center justify-center h-10 px-5 rounded-xl bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] text-white text-sm font-semibold shadow-md shadow-[#4F9DA6]/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4F9DA6]/20 overflow-hidden'
        >
          <span className='relative z-10 inline-flex items-center gap-2'>
            <Plus className='w-4 h-4' strokeWidth={2.5} />
            {buttonText}
          </span>
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700'
          />
        </button>
      )}
    </div>
  )
}

export default EmptyState