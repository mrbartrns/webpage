const mongoose = require('mongoose');
const test = require('./models/test');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/boards', err => {
    if (err) console.error;
    console.log('mongodb server connected');
});

const { Test, Sample } = require('./models/test');

Test.findOne({testString: 'hi'})
    .populate({
        path: '_sample',
        model: 'samples'
    })
    .then(test => console.log(test));

Test.findOne({testString: 'hi'})
    .then(test => {
        console.log(test);
        test.example = 'new new string';
        test.save()
            .then(test => console.log(test));
    })
/**
 * Post
        .findById(req.params.postid)
        .then(post => {
            console.log('phase 2');
            likesCount = post.likes;
            console.log(likesCount);
            console.log(likeFlag);
            if (likeFlag) {
                likesCount++;
                console.log(likesCount);
            } else {
                likesCount--;
                console.log(likesCount);
            }

            post.likes = likesCount;
            console.log('after like:', post);
            // not working+
            post.save()
                .then(post => res.json({success: true, post}))
        })
        .catch(err => console.error(err));

 */