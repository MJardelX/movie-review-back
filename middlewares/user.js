const { isValidObjectId } = require("mongoose");
const PasswordResetToken = require("../models/passwordResetToken");
const { sendError } = require("../utils/helper");
const jwt =require('jsonwebtoken');
const User = require("../models/user")


exports.isValidPassResetToken = async (req, res, next) => {
    const { token, userId } = req.body;
    if (!token.trim() || !isValidObjectId(userId)) {
        sendError(res, 'Token/UserId missing!');
    }
    
    const resetToken = await PasswordResetToken.findOne({ owner: userId });
    console.log(resetToken)
    if (!resetToken) return sendError(res, 'Unauthorized acces, invalid request!');

    const matched = await resetToken.compareToken(token);
    if (!matched) return sendError(res, 'Unauthorized acces, invalid request!');

    req.resetToken = resetToken;
    next();
    
}


exports.isAuth = async (req, res, next) =>{
    const token= req.headers?.authorization;

    const jwtToken = token.split('Bearer ')[1];
    if(!jwtToken) return sendError(res, 'Invalid token!');
    const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const {userId} = decode;

    const user = await User.findById(userId);
    if(!user) return sendError(res, 'Invalid token, user not found!', 401)

    req.user = user;
    next();
}