import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children }) => {
  // Close on Escape and lock background scrolling while the modal is open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-[#2A3439]/40 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      ></div>

      {/* Dialog panel */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
        className='relative flex flex-col w-full max-w-2xl max-h-[85vh] bg-white border border-[#DCE6E8] rounded-2xl shadow-xl shadow-[#4F9DA6]/10 overflow-hidden'
      >
        <button
          onClick={onClose}
          aria-label='Close'
          className='absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#647278] hover:text-[#2A3439] hover:bg-[#EAF2F2] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9DA6]/40'
        >
          <X className='w-5 h-5' strokeWidth={2} />
        </button>

        <div className='px-6 pt-6 pb-4 pr-14 border-b border-[#DCE6E8] shrink-0'>
          <h3 id='modal-title' className='text-lg font-semibold text-[#2A3439] tracking-tight'>
            {title}
          </h3>
        </div>

        <div className='px-6 py-5 overflow-y-auto text-sm text-[#2A3439]'>{children}</div>
      </div>
    </div>
  )
}

export default Modal