const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    chatWithBot,
    supportChat,
    getFAQ,
    analyzeReport,
    generateDietPlan,
    generate7DayPlan
} = require('../controllers/chatbotController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept text files, PDFs, and images
        const allowedMimes = [
            'text/plain',
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/csv'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only text, PDF, and image files are allowed.'));
        }
    }
});

// @route   POST /api/chatbot/chat (Report Analysis Chat)
router.post('/chat', chatWithBot);

// @route   POST /api/chatbot/support-chat (Customer Support Chat)
router.post('/support-chat', supportChat);

// @route   GET /api/chatbot/faq
router.get('/faq', getFAQ);

// @route   POST /api/chatbot/analyze-report
router.post('/analyze-report', analyzeReport);

// @route   POST /api/chatbot/diet-plan
router.post('/diet-plan', generateDietPlan);

// @route   POST /api/chatbot/7day-plan
router.post('/7day-plan', generate7DayPlan);

// @route   POST /api/chatbot/upload-report
router.post('/upload-report', upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Extract text from file
        let reportText = '';
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        if (mimeType === 'text/plain' || mimeType === 'text/csv') {
            reportText = fileBuffer.toString('utf-8');
        } else if (mimeType === 'application/pdf') {
            // For PDF, we'd need a PDF parser library
            // For now, return error suggesting text extraction
            return res.status(400).json({
                success: false,
                error: 'PDF files require text extraction. Please copy the text content and use the text input instead, or convert PDF to text first.'
            });
        } else if (mimeType.startsWith('image/')) {
            // For images, we'd need OCR
            // For now, return error
            return res.status(400).json({
                success: false,
                error: 'Image files require OCR. Please copy the text content and use the text input instead, or use an OCR tool to extract text first.'
            });
        }

        // Now analyze the report
        const { userProfile, activities = [], meals = [] } = req.body;
        
        // Call analyze report with extracted text
        req.body.reportText = reportText;
        req.body.userProfile = userProfile ? JSON.parse(userProfile) : null;
        req.body.activities = activities ? JSON.parse(activities) : [];
        req.body.meals = meals ? JSON.parse(meals) : [];

        // Use the analyzeReport controller
        const { analyzeReport } = require('../controllers/chatbotController');
        return analyzeReport(req, res);
    } catch (error) {
        console.error('[Upload Report Error]', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process uploaded report'
        });
    }
});

module.exports = router;

