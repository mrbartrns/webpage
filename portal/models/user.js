const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
        trim: true,
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

// crypt password before save
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

userSchema.methods.generateToken = function() {
    // _id를 이용해서 토큰으로 만든다.
    const token = jwt.sign(this._id.toHexString(), "secretToken");

    this.token = token;

    return this.save()
        .then(user => user)
        .catch(err => err);
}

// 토큰을 찾아서 작업을 수행 (회원정보 수정, 로그인권한 확인) 전에 필요한 중간 미들웨어
userSchema.statics.findByToken = function(token) {
    // user = Document
    let user = this;

    // secret token을 통해 user의 id 값을 받아오고, 해당 아이디를 통해 db에 접근, 유저 정보를 가져옴
    return jwt.verify(token, 'secretToken', (err, decoded) => {
        return user
            .findOne({_id: decoded, token: token})
            .then(user => user) // 유저 정보를 가져옴
            .catch(err => err)
    });
}

// methods는 Document 단위로 사용하는 함수이고
// statics는 Collection 단위로 사용하는 함수이다.

const User = mongoose.model('users', userSchema);

module.exports = {User};