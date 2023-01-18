const express = require('express');
const { create, verifyEmail, resendEmailVerificationToken, forgetPasswrod, sendResetPaswordTokenStatus, resetPassword, signInUser } = require('../controllers/user');
const { isValidPassResetToken, isAuth } = require('../middlewares/user');
const { userValidator, validatePassword, signInValidator } = require('../middlewares/validator');
const { validate } = require('../middlewares/validator');


const router = express.Router();


router.post('/create', userValidator, validate, create);
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification-token',resendEmailVerificationToken);
router.post('/forget-password', forgetPasswrod);
router.post('/verify-pass-reset-token', isValidPassResetToken, sendResetPaswordTokenStatus);
router.post('/reset-password',validatePassword, validate ,isValidPassResetToken, resetPassword);
router.post('/sign-in',signInValidator, validate , signInUser);

router.get('/is-auth', isAuth, (req, res)=>{
    const {user} = req;

    res.json({user:{
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
    }})
});

module.exports = router;