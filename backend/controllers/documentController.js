import Document from '../models/Document.js';        
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc Upload PDF document
// @route POST /api/documents/upload
// @access Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            // Delete uploaded file if title is missing
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Please provide a title for the document',
                statusCode: 400
            });
        }

        // Construct the URL for the uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,          // URL for client access
            localPath: req.file.path,   //  Store local path separately for fs.unlink
            fileSize: req.file.size,
            status: 'processing'
        });

        // Process PDF in background (in production, use a queue like Bull)
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        // Cleanup uploaded file if error occurs
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
    try {
    console.log('processing file at path:', filePath);
    console.log('File exists:', await fs.access(filePath).then(() => true).catch(() => false));
    
        const { text } = await extractTextFromPDF(filePath);

        // Create chunks
        const chunks = chunkText(text, 500, 50);

        // Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};


// @desc Get all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};


// @desc  Get single document with chunks
// @route GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid document ID',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,       
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id });

        //Update last accessed
        document.lastAccessed = new Date();
       await document.save();

       //Combine document data with counts
        const documentData = {
            ...document.toObject(),
            flashcardCount,
            quizCount
        };
        res.status(200).json({
            success: true,
            data: document
        });

    } catch (error) {
        next(error);
    }
};


// @desc  Delete document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid document ID',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,       
        });

        if (!document) {
            return res.status(404).json({
                success: false,                 
                error: 'Document not found',
                statusCode: 404
            });
        }

        //  'document' → 'documentId' to match schema foreign key
        await Flashcard.deleteMany({ documentId: document._id });
        await Quiz.deleteMany({ documentId: document._id });

       
        await fs.unlink(document.localPath).catch(() => {});

        // Delete document from DB
        await document.deleteOne();

       
        res.status(200).json({
            success: true,
            message: 'Document and associated data deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};


// @desc  Update document title
// @route PUT /api/documents/:id
// @access Private
export const updateDocument = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid document ID',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a new title',
                statusCode: 400
            });
        }

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },  
            { title },
            { new: true, runValidators: true }
        ).select('-extractedText -chunks');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: document,
        });

    } catch (error) {
        next(error);
    }
};
