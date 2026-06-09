const multer = require('multer');

const storage = multer.memoryStorage();

const MIME_BY_EXT = {
  csv: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain', 'application/octet-stream'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
};

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = Object.keys(MIME_BY_EXT);

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Unsupported file type. Allowed: .csv, .xlsx'), false);
  }

  if (file.mimetype && !MIME_BY_EXT[ext].includes(file.mimetype)) {
    return cb(new Error(`Invalid MIME type for .${ext}: ${file.mimetype}`), false);
  }

  cb(null, true);
};

const uploadCsv = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = uploadCsv;
