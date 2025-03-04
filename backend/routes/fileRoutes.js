const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const connectToDatabase = require('../utils/dbConnect');



// Path to the uploads folder
const uploadDir = path.join(__dirname, '..', 'uploads');

// Route to list all files with secure download links
router.get('/files', async (req, res) => {
    console.log("Fetching file list...");
    const db = await connectToDatabase();

    if (!db.existsSync(uploadDir)) {
        return res.status(404).json({ message: "Uploads directory not found" });
    }

    const fileNames = await db.readdirSync(uploadDir);
    const files = fileNames.map(fileName => ({
        name: fileName,
        size: db.statSync(path.join(uploadDir, fileName)).size,
        downloadUrl: `${req.protocol}://${req.get('host')}/users/download/${encodeURIComponent(fileName)}`
    }));

    res.status(200).json(files);
});

// Route to download a file correctly
router.get('/users/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(uploadDir, fileName);

    console.log(`Downloading file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }

    // Set correct content-type based on file extension
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream file to client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

module.exports = router