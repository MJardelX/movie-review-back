const express = require('express');
const { createActor, updateActor, removeActor } = require('../controllers/actor');
const { uploadImage } = require('../middlewares/multer');
const { actorInfoValidator, validate } = require('../middlewares/validator');
const router = express.Router();


router.post('/create', uploadImage.single('avatar'), actorInfoValidator, validate , createActor)
router.post('/update/:id', uploadImage.single('avatar'), actorInfoValidator, validate , updateActor)

router.delete('/:id', removeActor)

module.exports = router;