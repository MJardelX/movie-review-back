const User = require('../models/user');
const emailVerificationToken = require('../models/emailVerificationToken');
const { isValidObjectId } = require('mongoose');
const { generateOTP, generateMailTransporter } = require('../utils/mail');
const { sendError, generateRandomByte } = require('../utils/helper');
const passwordResetToken = require('../models/passwordResetToken');
const jwt = require('jsonwebtoken');

exports.create = async (req, res) => {
    const { name, email, password } = (req.body);
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        return sendError(res, "This email is already in use!");
    }
    const newUser = new User({
        name, email, password
    });
    await newUser.save();

    // GENERATE 6 DIGIT OTP
    let OTP = generateOTP();

    // STORE OTP INSIDE MONGO
    const newEmailVerificationToken = new emailVerificationToken({
        owner: newUser._id,
        token: OTP
    })

    await newEmailVerificationToken.save();


    var transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@reciewapp.com',
        to: newUser.email,
        subject: 'Email Verification',
        html: `
            <p> Your verification OTP </p>
            <h1> ${OTP} </h1>
        `
    })

    res.status(201).json({
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        },
        message: 'Pease verify your email. OTP has been sent to your email account!'
    })
}


exports.verifyEmail = async (req, res) => {
    const { userId, OTP } = req.body;

    if (!isValidObjectId(userId)) {
        return sendError(res, "Invalid user!");
    }

    const user = await User.findById(userId);
    if (!user) {
        return sendError(res, "User not found!", 404);
    }

    if (user.isVerified) {
        return sendError(res, "user is already verified!");
    }

    const token = await emailVerificationToken.findOne({ owner: userId });

    if (!token) {
        return sendError(res, "Token not found!", 404);
    }

    const isMatched = await token.compareToken(OTP);

    if (!isMatched) {
        return sendError(res, "Submit a valid OTP!");
    }

    user.isVerified = true;
    await user.save();

    await emailVerificationToken.findByIdAndDelete(token._id)

    var transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@reciewapp.com',
        to: user.email,
        subject: 'Welcome Email',
        html: "<h1>Welcome to our app </h1>"
    })

    const jwtToken = jwt.sign({
        userId: user._id
    }, process.env.JWT_SECRET);

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            token: jwtToken,
            isVerified: user.isVerified
        },
        message: "Your email is verified"
    })

}



exports.resendEmailVerificationToken = async (req, res) => {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {

        return sendError(res, "User not found!", 404);

    }
    if (user.isVerified) {
        return sendError(res, "user is already verified!");

    }

    const alreadyHasToken = await emailVerificationToken.findOne({ owner: userId });
    if (alreadyHasToken) {
        return sendError(res, "Only after one hour you can request for another token");
    }

    // GENERATE 6 DIGIT OTP
    let OTP = generateOTP();

    // STORE OTP INSIDE MONGO
    const newEmailVerificationToken = new emailVerificationToken({
        owner: user._id,
        token: OTP
    })

    await newEmailVerificationToken.save();


    var transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@reciewapp.com',
        to: user.email,
        subject: 'Email Verification',
        html: `
            <p> Your verification OTP </p>
            <h1> ${OTP} </h1>
        `
    })


    return res.json({
        message: 'Pease verify your email. OTP has been sent to your email account!'
    })

}


exports.forgetPasswrod = async (req, res) => {
    const { email } = req.body;
    if (!email) return sendError(res, "Email is missing!");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found!", 404);

    const alreadyHasToken = await passwordResetToken.findOne({ owner: user._id })
    if (alreadyHasToken) return sendError(res, 'Only after one hour you can reques for another token!');

    const token = await generateRandomByte();

    const newPasswordResetToken = new passwordResetToken({
        owner: user._id,
        token
    });

    await newPasswordResetToken.save();

    const resetPasswordURL = `http//localhost3000/auth/reset-password?token=${token}&id=${user._id}`;

    var transport = generateMailTransporter();

    transport.sendMail({
        from: 'security@reciewapp.com',
        to: user.email,
        subject: 'Reset Password Link',
        html: `
            <p> Click here to reset the password </p>
            <a href=${resetPasswordURL}> Change Password </a>
        `
    })

    return res.json({
        message: 'Link sent to your email'
    })
}



exports.sendResetPaswordTokenStatus = (req, res) => {
    res.json({
        valid: true
    })
}



exports.resetPassword = async (req, res) => {
    const { newPassword, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found!", 404);

    const matched = await user.comparePassword(newPassword);
    if (matched) return sendError(res, 'The new password must be different from the old one!');

    user.password = newPassword
    await user.save();

    await passwordResetToken.findByIdAndDelete(req.resetToken._id);

    const transport = generateMailTransporter();

    transport.sendMail({
        from: 'security@reciewapp.com',
        to: user.email,
        subject: 'Password Reset Successfully',
        html: `
            <h1> Password reset successfully </h1>
            <p> Now you can use your new password </p>
        `
    })

    return res.json({
        message: 'Password Reset Successfully'
    });
}



exports.signInUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 'Email/Pasword mismatch!');

    const matched = await user.comparePassword(password);
    if (!matched) return sendError(res, 'Email/Pasword mismatch!');

    const jwtToken = jwt.sign({
        userId: user._id
    }, process.env.JWT_SECRET);

    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            token: jwtToken,
            isVerified: user.isVerified
        }
    })
}
