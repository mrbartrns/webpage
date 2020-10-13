const mongoose = require('mongoose');
const crypto = require('crypto');
const { StringDecoder } = require('string_decoder');

// User Schema 만들기
const Schema = mongoose.Schema;

// id, pw, salt, email, nickname, role, token, tokenExp
// email has to be inspected before save
const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: 1,
        minlength: 6,
        maxlength: 20
    },

    pw: {
        type: String,
        required: true,
    },

    salt: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: 1
    },

    nickName: {
        type: String,
        required: true
    },

    role: {
        type: Number,
        required: true,
        default: 0
    },

    image: {
        type: String
    },

    token: {
        type: String
    },

    tokenExp: {
        type: Number
    }

});

userSchema.pre('save', function(next) {
    let user = this;
    if (user.isModified('pw')) {
        let plainPassword = user.pw;
        user.pw = crypto.pbkdf2Sync(plainPassword, user.salt, 100000, 64, 'sha512').toString('base64');
        next();
    } else {
        next();
    }
});

userSchema.methods.comparePassword = function(plainPassword) {
    // 여기서 this는 Router 상의 Document가 된다 => Promise 객체를 반환하여 비동기적으로 사용
    return new Promise((resolve, reject) => {
        let isMatch;
        const cryptedPw = crypto.pbkdf2Sync(plainPassword, this.salt, 100000, 64, 'sha512').toString('base64');
        isMatch = this.pw === cryptedPw;
        resolve(isMatch);
    });
}

const User = mongoose.model('users', userSchema);

module.exports = {User};