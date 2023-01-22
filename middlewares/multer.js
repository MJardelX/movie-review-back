const multer = require('multer');
const storage = multer.diskStorage({});


const imageFileFilter = (req, file, cb) =>{
    if(!file.mimetype.startsWith('image')){
        cb('Supported only image files!', false)
    }

    if(!file){
        cb('There must be an image', false)
    }
    cb(null, true)
} 

const videoFileFilter = (req, file, cb) =>{
    if(!file.mimetype.startsWith('video')){
        cb('Supported only video files!', false)
    }

    if(!file){
        cb('There must be an image', false)
    }
    cb(null, true)
} 

exports.uploadImage = multer({storage, fileFilter: imageFileFilter})

exports.uploadVideo = multer({storage, fileFilter: videoFileFilter})
