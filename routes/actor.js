const express = require('express');
const { createActor, updateActor, removeActor, searchActor, getLatestActors, getSingleActor } = require('../controllers/actor');
const { uploadImage } = require('../middlewares/multer');
const { actorInfoValidator, validate } = require('../middlewares/validator');
const router = express.Router();


router.post('/create', uploadImage.single('avatar'), actorInfoValidator, validate , createActor)
router.post('/update/:id', uploadImage.single('avatar'), actorInfoValidator, validate , updateActor)

router.delete('/:id', removeActor)
router.get('/search', searchActor)
router.get('/latest-uploads', getLatestActors)
router.get('/single/:id', getSingleActor)

module.exports = router;


// ypeyjmfyu7dermmlswokc3sxwljl7gvawdqd6ju7cuoddokijg4a