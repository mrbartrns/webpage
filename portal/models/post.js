const { ExpectationFailed } = require('http-errors');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    board_id: {
        type: Schema.Types.ObjectId,
        ref: 'boards',
        required: true
    },

    id: {
        type: String,
        required: true
    },

    nickName: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },
    
    contents: {
        type: String,
        required: true
    },

    tags: [{
        type: String
    }],

    comments: [{
        type: Schema.Types.ObjectId,
        ref:'comments'
    }],

    views: {
        type: Number,
        required: true,
        default: 0
    },

    likes: {
        type: Number,
        required: true,
        default: 0
    },

    regDate: {
        type: Date,
        required: true,
        default: Date.now()
    },

    modDate: {
        type: Date,
    },

    img: {
        type: String
    }
});

postSchema.pre('save', function(next) {
    let post = this;
    // 저장하는 것은 save에서 하므로, 수정일만 
    if (post.isModified('title' || 'contents' || 'tags')) {
        post.modDate = Date.now();
        next();
    } else {
        next();
    }
});

// postSchema.post('save', function() {
//     Post
//         .find()
//         .sort({regDate: -1})
//         .exec()
// });


const Post = mongoose.model('posts', postSchema);

module.exports = { Post };
