const { isValidObjectId } = require("mongoose");
const Actor = require("../models/actor");
const cloudinary = require('cloudinary').v2;
const { sendError } = require("../utils/helper")

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    // secure: true
});


exports.createActor = async (req, res) => {
    const { name, about, gender } = req.body;
    const { file } = req;

    const newActor = new Actor({ name, about, gender });

    if (file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {gravity: "face", height: 500, width: 500, crop: "thumb"})
        newActor.avatar = {
            url: secure_url,
            public_id
        }
    }

    await newActor.save();

    res.status(201).json({
        actor: {
            id: newActor._id,
            name,
            about,
            gender,
            avatar: newActor.avatar?.url
        }
    })
}


exports.updateActor = async (req, res) => {
    const { name, about, gender } = req.body;
    const { file } = req;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return sendError(res, 'Invalid request!')
    }

    const actor = await Actor.findById(id);
    if (!actor) {
        return sendError(res, 'Invalid request, record not found!', 404);
    }

    const public_id = actor.avatar?.public_id;

    if (public_id && file) {
        const { result } = await cloudinary.uploader.destroy(public_id);
        if (result !== 'ok') {
            return reusendError(res, 'Could not remove image from cloud!')
        }
        console.log(result);
    }

    // upload avatar
    if (file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {gravity: "face", height: 500, width: 500, crop: "thumb"})
        actor.avatar = {
            url: secure_url,
            public_id
        }
    }

    actor.name = name;
    actor.about = about;
    actor.gender = gender;


    await actor.save();

    res.status(201).json({
        actor: {
            id: actor._id,
            name,
            about,
            gender,
            avatar: actor.avatar?.url
        }
    })
}