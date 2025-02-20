const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Path to the uploads folder
const uploadDir = path.join(__dirname, '..', 'uploads');

// Route to list all files with secure download links
router.get('/files', (req, res) => {

    if (!fs.existsSync(uploadDir)) {
        return res.status(404).json({ message: "Uploads directory not found" });
    }
    const fileNames = fs.readdirSync(uploadDir)
    console.log(fileNames)
    const files = fileNames.map(fileName => ({
        name: fileName,
        size: fs.statSync(path.join(uploadDir, fileName)).size,
        downloadUrl: "http://localhost:8000/api/files/download/" + encodeURIComponent(fileName),
    }));
    console.log(files)
    res.status(200).json(files);

});

// Route to download a file correctly
router.get('/files/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }

    // Set correct content-type based on file extension
    const mime = require('mime-types'); // Ensure you install it: npm install mime-types
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream file to client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

module.exports = router