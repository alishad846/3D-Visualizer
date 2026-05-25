const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'webp', 'svg'];
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed formats: .glb, .gltf, .png, .jpg, .jpeg, .webp, .svg'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024 // 150 MB limit
  }
});

module.exports = upload;