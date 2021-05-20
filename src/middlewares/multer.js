const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'resources/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  }
  else {
    const error = new Error('This file is not an image');
    error.statusCode = 400;
    cb(error);
  }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter });