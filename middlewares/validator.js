const { check, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const genres = require('../utils/genres');

exports.userValidator = [
    check('name').trim().not().isEmpty().withMessage('Name is missing!'),
    check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
    check('password').trim().not().isEmpty().withMessage('Pasword Is missing!').isLength({ min: 8, max: 20 }).withMessage('Password must be 8 to 20 characters long!')
]

exports.validate = (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length) {
        return res.status(400).json({
            error: errors[0].msg
        })
    }
    next();
}

exports.validatePassword = [
    check('newPassword').trim().not().isEmpty().withMessage('Pasword Is missing!').isLength({ min: 8, max: 20 }).withMessage('Password must be 8 to 20 characters long!')
]


exports.signInValidator = [
    check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
    check('password').trim().not().isEmpty().withMessage('Pasword Is missing!')
]


exports.actorInfoValidator = [
    check('name').trim().not().isEmpty().withMessage('Name is a required field!'),
    check('about').trim().not().isEmpty().withMessage('About is a required field!'),
    check('gender').trim().not().isEmpty().withMessage('Gender is a required field'),
]


exports.validateMovie = [
    check('title').trim().not().isEmpty().withMessage('Movie title is missing!'),
    check('storyLine').trim().not().isEmpty().withMessage('Movie story line is missing!'),
    check('language').trim().not().isEmpty().withMessage('Movie language line is missing!'),
    check('releaseDate').isDate().withMessage('Movie release line is missing!'),
    check('status').isIn(['public', 'private']).withMessage('Movie status must ve public or private!'),
    check('type').trim().not().isEmpty().withMessage('Movie type line is missing!'),
    check('genres').isArray().withMessage('Genres must be an array').custom((value, { req }) => {
        for (let g of value) {
            if (!genres.includes(g)) throw Error('Invalid genre!')
        }

        return true;
    }),
    check('tags').isArray({ min: 1 }).withMessage('Tags must be an array of strings!').custom((tags) => {
        for (let tag of tags) {
            if (typeof tag !== 'string') throw Error('Invalid type!')
        }
        return true;

    }),
    check('cast').isArray().withMessage('Cast must be an array of objects').custom((cast, { req }) => {
        for (let c of cast) {
            if (!isValidObjectId(c.actor)) throw Error('Invalid cast id inside cast!')
            if (!c.roleAs?.trim()) throw Error('Role As is missing inside cast!')
            if (typeof c.leadActor !== 'boolean') throw Error('Only accepted boolean value inside leadActor inside cast!')
        }
        return true;
    }),

    check('trailer').isObject().withMessage('Trailer must be an object with url and public_id').custom(({ url, public_id }) => {
        try {
            const result = new URL(url);
            if (!result.protocol.includes('http')) throw Error("Trailer url is invalid!")

            const arr = url.split("/");
            publicId = arr[arr.length - 1].split('.')[0];

            if (publicId !== public_id) throw Error("Trailer public_id is invalid!")

            return true;


        } catch (error) {
            throw Error("Trailer url is invalid!")
        }
    }),

    // check('poster').custom((_, { req }) => {
    //     if (!req.file) Error("Poster file is missing!");

    //     return true;
    // })
]