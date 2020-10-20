const { Post } = require('../models/post');

// it is middleware
// 새로고침시마다 viewCount를 증가시키지 말고 한번 증가 후 얼마 있다가 증가로
let views = (req, res, next) => {
    // console.log(req);
    console.log(req);
    next();
};

module.exports = { views };