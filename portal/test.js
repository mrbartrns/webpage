const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/boards', err => {
    if (err) console.error;
    console.log('mongodb server connected');
});

const {User} = require('./models/user');
const { Board } = require('./models/boardname');
const { Post } = require('./models/post');

Post.findOne({title: 'test3'})
    .then(post => console.log(post));

// 하나 이상의 ObjectId를 참조할 때, path와 model 지정이 꼭 필요하다.
Post.findOne({title: 'test3'})
    .populate({
        path: '_board',
        model: 'boards'
    })
    .exec()
    .then(post => console.log(post));

// const date = Date.now()
// setInterval(() => {
//     console.log(date);
// }, 1000)