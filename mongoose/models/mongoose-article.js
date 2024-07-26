const mongoose = require('mongoose');

const Article = mongoose.model('Article', {
    uid: String,
    title: String,
    content: String,
    author: String
}, 'articles');

// j'exporte la classe/model Article
module.exports = Article;