import express from 'express'
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument
} from '../controllers/documentController.js'
import protect from '../middleware/auth.js'
import upload from '../config/multer.js'

const router = express.Router()

// All routes are protected, so we use the protect middleware
router.use(protect)

router.post('/upload', protect, upload.single('file'), uploadDocument)
router.get('/', protect, getDocuments)
router.get('/:id', protect, getDocument)
router.delete('/:id', protect, deleteDocument)

export default router