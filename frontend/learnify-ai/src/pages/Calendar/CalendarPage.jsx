import { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  CalendarDays,
  ListChecks,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import toast from 'react-hot-toast'

import eventService from '../../services/eventService'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

const secondaryButtonClasses = `inline-flex items-center justify-center h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`

const dangerButtonClasses =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md shadow-red-600/20 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed'

const navButtonClasses = `inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-slate-200 bg-white text-slate-900 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 ${focusRing}`

const inputClasses =
  'w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white'

const labelClasses =
  'block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2'

const typeStyles = {
  study: 'bg-emerald-100 text-emerald-700',
  quiz: 'bg-amber-100 text-amber-700',
  revision: 'bg-sky-100 text-sky-700',
  other: 'bg-slate-100 text-slate-600',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (n) => String(n).padStart(2, '0')
const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toTimeValue = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const emptyForm = {
  title: '',
  description: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  type: 'study',
}

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // 6 weeks x 7 days grid starting on the Sunday on/before the 1st
  const gridDays = useMemo(() => {
    const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [currentMonth])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const start = new Date(gridDays[0])
      const end = new Date(gridDays[41])
      end.setHours(23, 59, 59, 999)
      const data = await eventService.getEvents(start.toISOString(), end.toISOString())
      setEvents(data || [])
    } catch (error) {
      toast.error('Failed to fetch tasks.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((ev) => {
      const key = toDateKey(new Date(ev.startDate))
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  }, [events])

  // Stats for the month being viewed
  const monthEvents = events.filter((ev) => {
    const d = new Date(ev.startDate)
    return (
      d.getMonth() === currentMonth.getMonth() &&
      d.getFullYear() === currentMonth.getFullYear()
    )
  })
  const todoCount = monthEvents.filter((ev) => !ev.completed).length
  const completedCount = monthEvents.filter((ev) => ev.completed).length

  const selectedKey = toDateKey(selectedDate)
  const todayKey = toDateKey(new Date())
  const agendaEvents = eventsByDay[selectedKey] || []

  const goToPrevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const goToNextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(now)
  }

  const openCreateModal = (day) => {
    setEditingEvent(null)
    setForm({ ...emptyForm, date: toDateKey(day) })
    setIsModalOpen(true)
  }

  const openEditModal = (ev) => {
    const start = new Date(ev.startDate)
    const end = new Date(ev.endDate)
    setEditingEvent(ev)
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: toDateKey(start),
      startTime: toTimeValue(start),
      endTime: toTimeValue(end),
      type: ev.type || 'study',
    })
    setIsModalOpen(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const startDate = new Date(`${form.date}T${form.startTime}`)
    const endDate = new Date(`${form.date}T${form.endTime}`)

    if (endDate < startDate) {
      toast.error('End time cannot be before start time.')
      return
    }

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }

    setSaving(true)
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, payload)
        toast.success('Task updated.')
      } else {
        await eventService.createEvent(payload)
        toast.success('Task added.')
      }
      setIsModalOpen(false)
      setSelectedDate(new Date(`${form.date}T00:00`))
      fetchEvents()
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to save task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ev) => {
    const target = ev || editingEvent
    if (!target) return
    setSaving(true)
    try {
      await eventService.deleteEvent(target._id)
      toast.success('Task deleted.')
      setIsModalOpen(false)
      fetchEvents()
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to delete task.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async (ev) => {
    // update the screen immediately, then sync with the server
    setEvents((prev) =>
      prev.map((item) =>
        item._id === ev._id ? { ...item, completed: !item.completed } : item
      )
    )
    try {
      await eventService.updateEvent(ev._id, { completed: !ev.completed })
    } catch (error) {
      toast.error(error.error || error.message || 'Failed to update task.')
      fetchEvents()
    }
  }

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const agendaLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1'>
            <CalendarDays className='w-4 h-4' strokeWidth={2} />
            Stay on track
          </div>
          <h1 className='text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight'>
            Calendar &amp; tasks
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            Plan your study sessions and keep every deadline in sight.
          </p>
        </div>
        <button
          onClick={() => openCreateModal(selectedDate)}
          className={`${primaryButtonClasses} shrink-0`}
        >
          <Plus className='w-4 h-4' strokeWidth={2.5} />
          Add task
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl'>
        <div className='flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50'>
            <ListChecks className='w-5 h-5 text-emerald-600' strokeWidth={2} />
          </div>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>To do</p>
            <p className='text-lg font-semibold text-slate-900'>{todoCount}</p>
          </div>
        </div>
        <div className='flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50'>
            <CheckCircle2 className='w-5 h-5 text-emerald-600' strokeWidth={2} />
          </div>
          <div>
            <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>Completed</p>
            <p className='text-lg font-semibold text-slate-900'>{completedCount}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start'>
        {/* Calendar */}
        <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4'>
            <h3 className='text-base font-semibold text-slate-900'>{monthLabel}</h3>
            <div className='flex items-center gap-2'>
              <button
                onClick={goToToday}
                className={`px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 ${focusRing}`}
              >
                Today
              </button>
              <button onClick={goToPrevMonth} aria-label='Previous month' className={navButtonClasses}>
                <ChevronLeft className='w-4 h-4' strokeWidth={2.5} />
              </button>
              <button onClick={goToNextMonth} aria-label='Next month' className={navButtonClasses}>
                <ChevronRight className='w-4 h-4' strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-7 border-y border-slate-200 bg-slate-50'>
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className='py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide'
              >
                {day}
              </div>
            ))}
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-24'>
              <Spinner />
            </div>
          ) : (
            <div className='grid grid-cols-7'>
              {gridDays.map((day, index) => {
                const key = toDateKey(day)
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                const isToday = key === todayKey
                const isSelected = key === selectedKey
                const dayEvents = eventsByDay[key] || []

                return (
                  <div
                    key={key}
                    role='button'
                    tabIndex={0}
                    onClick={() => setSelectedDate(day)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedDate(day)
                    }}
                    className={`min-h-24 p-1.5 border-b border-r border-slate-100 cursor-pointer transition-colors duration-150 ${
                      index % 7 === 6 ? 'border-r-0' : ''
                    } ${
                      isSelected
                        ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500/40'
                        : isCurrentMonth
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/60 hover:bg-slate-50'
                    } ${focusRing}`}
                  >
                    <div className='flex justify-center'>
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-full ${
                          isToday
                            ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white'
                            : isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    <div className='mt-1 space-y-1'>
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev._id}
                          title={ev.title}
                          className={`truncate px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            typeStyles[ev.type] || typeStyles.other
                          } ${ev.completed ? 'line-through opacity-60' : ''}`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className='px-1.5 text-[11px] font-medium text-slate-500'>
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Agenda */}
        <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden lg:sticky lg:top-4'>
          <div className='flex items-start justify-between gap-3 p-5 border-b border-slate-200'>
            <div>
              <p className='text-xs font-semibold text-emerald-600 uppercase tracking-wide'>
                Your agenda
              </p>
              <h3 className='text-base font-semibold text-slate-900 mt-1'>{agendaLabel}</h3>
              <p className='text-xs text-slate-500 mt-1'>
                {agendaEvents.length} {agendaEvents.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <button
              onClick={() => openCreateModal(selectedDate)}
              aria-label='Add task'
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200 ${focusRing}`}
            >
              <Plus className='w-4 h-4' strokeWidth={2.5} />
            </button>
          </div>

          {agendaEvents.length === 0 ? (
            <div className='flex flex-col items-center text-center px-6 py-12'>
              <div className='flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 mb-3'>
                <CalendarDays className='w-6 h-6 text-emerald-600' strokeWidth={2} />
              </div>
              <p className='text-sm font-semibold text-slate-900'>Nothing planned yet</p>
              <p className='text-xs text-slate-500 mt-1'>Add a task to make this day count.</p>
              <button
                onClick={() => openCreateModal(selectedDate)}
                className={`mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700 ${focusRing}`}
              >
                Create a task
              </button>
            </div>
          ) : (
            <ul className='divide-y divide-slate-100'>
              {agendaEvents.map((ev) => (
                <li key={ev._id} className='flex items-start gap-3 p-4'>
                  <button
                    onClick={() => handleToggleComplete(ev)}
                    aria-label={ev.completed ? 'Mark as not done' : 'Mark as done'}
                    className={`mt-0.5 inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md border-2 transition-colors duration-200 ${focusRing} ${
                      ev.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {ev.completed && <Check className='w-3.5 h-3.5' strokeWidth={3} />}
                  </button>

                  <div className='flex-1 min-w-0'>
                    <p
                      className={`text-sm font-semibold ${
                        ev.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {ev.title}
                    </p>
                    <p className='text-xs text-slate-500 mt-0.5'>
                      {formatTime(ev.startDate)} - {formatTime(ev.endDate)}
                    </p>
                    {ev.description && (
                      <p className='text-xs text-slate-500 mt-1 line-clamp-2'>{ev.description}</p>
                    )}
                    <span
                      className={`inline-flex mt-2 px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
                        typeStyles[ev.type] || typeStyles.other
                      }`}
                    >
                      {ev.type}
                    </span>
                  </div>

                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      onClick={() => openEditModal(ev)}
                      aria-label='Edit task'
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 ${focusRing}`}
                    >
                      <Pencil className='w-4 h-4' strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev)}
                      aria-label='Delete task'
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 ${focusRing}`}
                    >
                      <Trash2 className='w-4 h-4' strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add / edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Task' : 'Add Task'}
      >
        <form onSubmit={handleSave} className='space-y-4'>
          <div>
            <label htmlFor='title' className={labelClasses}>Title</label>
            <input
              id='title'
              name='title'
              type='text'
              value={form.title}
              onChange={handleChange}
              required
              placeholder='e.g. Revise Chapter 3'
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor='description' className={labelClasses}>Notes</label>
            <textarea
              id='description'
              name='description'
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder='Optional'
              className='w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div>
              <label htmlFor='date' className={labelClasses}>Date</label>
              <input id='date' name='date' type='date' value={form.date}
                onChange={handleChange} required className={inputClasses} />
            </div>
            <div>
              <label htmlFor='startTime' className={labelClasses}>Start</label>
              <input id='startTime' name='startTime' type='time' value={form.startTime}
                onChange={handleChange} required className={inputClasses} />
            </div>
            <div>
              <label htmlFor='endTime' className={labelClasses}>End</label>
              <input id='endTime' name='endTime' type='time' value={form.endTime}
                onChange={handleChange} required className={inputClasses} />
            </div>
          </div>

          <div>
            <label htmlFor='type' className={labelClasses}>Type</label>
            <select id='type' name='type' value={form.type}
              onChange={handleChange} className={inputClasses}>
              <option value='study'>Study</option>
              <option value='quiz'>Quiz</option>
              <option value='revision'>Revision</option>
              <option value='other'>Other</option>
            </select>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
            <div>
              {editingEvent && (
                <button
                  type='button'
                  onClick={() => handleDelete()}
                  disabled={saving}
                  className={dangerButtonClasses}
                >
                  <Trash2 className='w-4 h-4' strokeWidth={2} />
                  Delete
                </button>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className={secondaryButtonClasses}
              >
                Cancel
              </button>
              <button type='submit' disabled={saving} className={primaryButtonClasses}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CalendarPage