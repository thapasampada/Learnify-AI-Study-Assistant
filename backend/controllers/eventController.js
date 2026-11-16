import Event from '../models/Event.js'

// @desc Get events in a date range
// @route GET /api/events?start=ISO&end=ISO
// @access Private
export const getEvents = async (req, res, next) => {
    try {
        const { start, end } = req.query
        const query = { userId: req.user._id }

        if (start && end) {
            // events that overlap the range
            query.startDate = { $lte: new Date(end) }
            query.endDate = { $gte: new Date(start) }
        }

        const events = await Event.find(query)
            .populate('documentId', 'title')
            .sort({ startDate: 1 })

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        })
    } catch (error) {
        next(error)
    }
}

// @desc Create an event
// @route POST /api/events
// @access Private
export const createEvent = async (req, res, next) => {
    try {
        const { title, description, startDate, endDate, type, documentId } = req.body

        if (!title || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Title, start date and end date are required',
                statusCode: 400
            })
        }

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                error: 'End date cannot be before start date',
                statusCode: 400
            })
        }

        const event = await Event.create({
            userId: req.user._id,
            title,
            description,
            startDate,
            endDate,
            type,
            documentId: documentId || null
        })

        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc Update an event
// @route PUT /api/events/:id
// @access Private
export const updateEvent = async (req, res, next) => {
    try {
        const allowed = ['title', 'description', 'startDate', 'endDate', 'type', 'completed', 'documentId']
        const updates = {}
        allowed.forEach((key) => {
            if (req.body[key] !== undefined) updates[key] = req.body[key]
        })

        if (updates.startDate && updates.endDate &&
            new Date(updates.endDate) < new Date(updates.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'End date cannot be before start date',
                statusCode: 400
            })
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        )

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            success: true,
            data: event,
            message: 'Event updated successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc Delete an event
// @route DELETE /api/events/:id
// @access Private
export const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
                statusCode: 404
            })
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        })
    } catch (error) {
        next(error)
    }
}