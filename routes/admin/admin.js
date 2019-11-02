/*jshint esversion:6*/
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const faker = require('faker');
const {userAuthenticated}=require('../../helpers/authentication');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    const promises=[
        Post.countDocuments().exec(),
        Category.countDocuments().exec(),
        Comment.countDocuments().exec()      
    ];
    Promise.all(promises).then(([postCount,categoryCount,commentCount])=>{
        res.render('admin/index',{postCount:postCount,categoryCount:categoryCount,commentCount:commentCount});
        console.log(postCount);
    });
    // Post.countDocuments().then(postCount=>{

    //     res.render('admin/index',{postCount:postCount});
    // });
});

router.post('/generate-fake-posts', (req, res) => {
    for (let i = 0; i < req.body.amount; i++) {
        let post = new Post();
        let status = Math.floor(Math.random() * Math.floor(2));
        if (status === 0) {
            post.status = 'public';
        } else {
            post.status = 'private';
        }
        
        post.title = faker.name.title();
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.paragraphs();
        post.slug=faker.name.title();
        post.save().then(()=>{
            console.log(i);
        });
    }
    res.redirect('/admin/posts');
});

module.exports = router;