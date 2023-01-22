const express = require('express');
const { uploadTrailer } = require('../controllers/movie');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { uploadVideo } = require('../middlewares/multer');
const router = express.Router();


router.post('/upload-trailer', isAuth, isAdmin, uploadVideo.single("video"), uploadTrailer);



module.exports = router;


// ypeyjmfyu7dermmlswokc3sxwljl7gvawdqd6ju7cuoddokijg4a