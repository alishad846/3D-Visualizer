const multer = require('multer');

const storage = multer.memoryStorage();

const MIME_BY_EXT = {
  glb: ['model/gltf-binary', 'application/octet-stream'],
  gltf: ['model/gltf+json', 'application/json', 'text/plain'],
  usdz: ['model/vnd.usdz+zip', 'application/zip', 'application/octet-stream'],
  png: ['image/png', 'application/octet-stream'],
  jpg: ['image/jpeg', 'application/octet-stream'],
  jpeg: ['image/jpeg', 'application/octet-stream'],
  webp: ['image/webp', 'application/octet-stream'],
  svg: ['image/svg+xml', 'text/xml', 'application/xml'],
};

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = Object.keys(MIME_BY_EXT);

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error('Unsupported file type. Allowed: .glb, .gltf, .usdz, .png, .jpg, .jpeg, .webp, .svg'),
      false
    );
  }

  const allowedMimes = MIME_BY_EXT[ext];
  if (file.mimetype && !allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`Invalid MIME type for .${ext}: ${file.mimetype}`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024 // 150 MB limit
  }
});

module.exports = upload;