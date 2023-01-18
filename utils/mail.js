const nodemailer = require('nodemailer');


exports.generateOTP = (otp_length = 6) => {

    // GENERATE 6 DIGIT OTP
    let OTP = "";
    for (let i = 0; i < otp_length; i++) {
        const randomVal = Math.round(Math.random() * 9);
        OTP += randomVal;
    }

    return OTP;
}


exports.generateMailTransporter = () => {
   return nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAIL_TRAP_USER,
            pass: process.env.MAIL_TRAP_PASSWORD
        }
    }); 
}