const express = require('express');
const multer = require('multer');
const path = require('path');
const { processWorkItems, updateTimesheet } = require('./utils/graphService');
require('dotenv').config();

const app = express();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Only CSV files are allowed'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// API endpoints
app.post('/api/upload', upload.single('workItems'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // For testing/development, just return success
        res.json({
            success: true,
            message: 'File uploaded successfully',
            excelUrl: 'https://example.com/your-excel-file' // Replace with actual URL
        });

        // TODO: Implement actual file processing
        // const workItemsByDate = await processWorkItems(req.file.path);
        // const result = await updateTimesheet(workItemsByDate);
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});