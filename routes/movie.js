const express = require('express');
const { uploadTrailer, createMovie, updateMovieWithoutPoster, updateMovieWithPoster, removeMovie, getMovies } = require('../controllers/movie');
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


router.delete('/:movieId', isAuth, isAdmin, removeMovie)
router.get('/movies', isAuth, isAdmin, getMovies)




module.exports = router;

