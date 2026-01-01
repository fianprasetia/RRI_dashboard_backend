const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../assets/file/dummy-file.bin'); // atau sesuaikan path-nya
  try {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;
