const express = require('express');
const { createActor, updateActor, removeActor, searchActor, getLatestActors, getSingleActor } = require('../controllers/actor');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/multer');
const { actorInfoValidator, validate } = require('../middlewares/validator');
const router = express.Router();


router.post('/create', isAuth, isAdmin, uploadImage.single('avatar'), actorInfoValidator, validate , createActor)
router.post('/update/:id', isAuth, isAdmin, uploadImage.single('avatar'), actorInfoValidator, validate , updateActor)
router.delete('/:id', isAuth, isAdmin, removeActor)
router.get('/search', isAuth, isAdmin, searchActor)
router.get('/latest-uploads', isAuth, isAdmin, getLatestActors)
router.get('/single/:id', getSingleActor)

module.exports = router;


// ypeyjmfyu7dermmlswokc3sxwljl7gvawdqd6ju7cuoddokijg4a