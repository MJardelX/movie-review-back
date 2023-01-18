const multer = require('multer');
const storage = multer.diskStorage({});


const fileFilter = (req, file, cb) =>{
    if(!file.mimetype.startsWith('image')){
        cb('Supported only image files!', false)
    }

    if(!file){
        cb('There must be an image', false)
    }
    // console.log("file", file)
    cb(null, true)
} 

exports.uploadImage = multer({storage, fileFilter})