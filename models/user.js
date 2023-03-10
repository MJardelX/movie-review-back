const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs')
const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified:{
        type:Boolean,
        required: true,
        default: false
    },
    role:{
        type: String,
        required: true,
        default: 'user',
        enum:['admin','user']
    }
})


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hash = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
        console.log(hash)
        this.password = hash;
    }
    next();
})


userSchema.methods.comparePassword = async function(password){
    const result = await bcrypt.compareSync(password, this.password);
    return result;
 }


module.exports = mongoose.model("User", userSchema);