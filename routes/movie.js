const express = require('express');
const { uploadTrailer, createMovie } = require('../controllers/movie');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { uploadVideo, uploadImage } = require('../middlewares/multer');
const { validateMovie, validate } = require('../middlewares/validator');
const { parseDataToJSON } = require('../utils/helper');
const router = express.Router();


router.post('/upload-trailer', isAuth, isAdmin, uploadVideo.single("video"), uploadTrailer);
router.post(
    "/create",
    isAuth,
    isAdmin,
    uploadImage.single("poster"),
    parseDataToJSON,
    validateMovie,
    validate,
    createMovie
  );
// uploadVideo.single("video"), validateMovie, validate


module.exports = router;


// ypeyjmfyu7dermmlswokc3sxwljl7gvawdqd6ju7cuoddokijg4a