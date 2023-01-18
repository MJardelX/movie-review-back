
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const passwordResetTokenSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    token:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: '60m',
    },
});

passwordResetTokenSchema.pre('save', async function (next) {
    if (this.isModified('token')) {
        const hash = await bcrypt.hashSync(this.token, bcrypt.genSaltSync(10));
        this.token = hash;
    }
    next();
})

passwordResetTokenSchema.methods.compareToken = async function(token){
   const result = await bcrypt.compareSync(token, this.token);
   return result;
}

module.exports = mongoose.model("passwordResetToken", passwordResetTokenSchema);


