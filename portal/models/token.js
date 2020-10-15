const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// token의 시간이 만료됬다면, 블랙리스트에 추가하여 재사용이 어렵게 만든다.
const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    }
});

tokenSchema.statics.isExpired = function(token) {
    let myToken = this;
    let isExpired;
    return new Promise((resolve, reject) => {
        myToken.findOne({token: token})
            .then(token => {
                if (token) {
                    isExpired = true;
                } else {
                    isExpired = false;
                }
                resolve(isExpired);
            })
    });
}

const TokenBlackList = mongoose.model('tokenBlackLists', tokenSchema);

module.exports = { TokenBlackList };