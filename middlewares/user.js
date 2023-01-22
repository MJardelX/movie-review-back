const { isValidObjectId } = require("mongoose");
const PasswordResetToken = require("../models/passwordResetToken");
const { sendError } = require("../utils/helper");



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


