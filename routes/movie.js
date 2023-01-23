const express = require('express');
const { uploadTrailer, createMovie, updateMovieWithoutPoster, updateMovieWithPoster } = require('../controllers/movie');
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

router.patch(
    "/update-movie-without-poster/:movieId",
    isAuth,
    isAdmin,
    // parseDataToJSON,
    validateMovie,
    validate,
    updateMovieWithoutPoster
);


router.patch(
    "/update-movie-with-poster/:movieId",
    isAuth,
    isAdmin,
    uploadImage.single("poster"),
    parseDataToJSON,
    validateMovie,
    validate,
    updateMovieWithPoster
);



// uploadVideo.single("video"), validateMovie, validate


module.exports = router;


// ypeyjmfyu7dermmlswokc3sxwljl7gvawdqd6ju7cuoddokijg4a