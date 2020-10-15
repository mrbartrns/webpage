const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// token의 시간이 만료됬다면, 블랙리스트에 추가하여 재사용이 어렵게 만든다.
const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    }
});

// tokenSchema.statics.something => 주어진 토큰이 주어졌는지 아닌지 확인

const TokenBlackList = mongoose.model('tokenBlackLists', tokenSchema);

module.exports = { TokenBlackList };