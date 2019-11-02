/*jshint esversion:6*/
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post.js');
const Category = require('../../models/Category.js');
const fs = require('fs');
const path = require('path');
const {
    userAuthenticated
} = require('../../helpers/authentication');
const {
    isEmpty,
    uploadDir
} = require('../../helpers/upload-helper.js');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});
/**
 * ?All the get request
 */
// NOTE for the index file you can do res.render(`admin/posts/index`) ==> res.render(`admin/posts`)
router.get('/', (req, res) => {
    Post.find({}).populate('category').then(posts => {
        res.render('admin/posts', {
            posts: posts
        });
    }).catch(err => {
        // TODO  catch the error
    });
});
router.get('/create', (req, res) => {
    Category.find({}).then(categories => {

        res.render(`admin/posts/create`, {
            categories: categories
        });
    });
});

router.get('/my-posts', (req, res) => {
    Post.find({
        user: req.user.id
    }).populate('category').then(posts => {
        res.render('admin/posts/my-posts', {
            posts: posts
        });
    });
});
/**
 * ? All the Post request
 */
router.post('/create', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({
            message: 'please add a title'
        });
    }
    if (!req.body.status) {
        errors.push({
            message: 'please add a status'
        });
    }
    if (!req.body.body) {
        errors.push({
            message: 'please add a description'
        });
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {

        let filename = "unknown";
        if (!isEmpty(req.files)) {
            let file = req.files.file;
            const path = './public/uploads/';
            filename = Date.now() + '-' + file.name;

            file.mv(path + filename, (err) => {
                if (err) console.log(err);
            });

        }

        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }
        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            file: filename,
            category: req.body.category
        });
        newPost.save().then(savedPost => {
            console.log(savedPost.date);
            req.flash('success_message', `${savedPost.title} was cerated successfully`);
            res.redirect('/admin/posts/my-posts');
        }).catch(validator => {
            //NOTE Second way of doing validation
            // res.render('admin/posts/create',{errors:validator.errors});
            //console.log(validator.errors);
        });
    }

});
router.get('/edit/:id', (req, res) => {

    Post.findOne({
            _id: req.params.id
        })
        .then(post => {
            Category.find({}).then(categories => {

                res.render(`admin/posts/edit`, {
                    post: post,
                    categories: categories
                });
            });
        }).catch(err => {
            // TODO  catch the error
        });
});

router.put('/edit/:id', (req, res) => {
    let errors = [];
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }
    if (!req.body.title) {
        errors.push({
            message: 'please add a title'
        });
    }
    if (!req.body.status) {
        errors.push({
            message: 'please add a status'
        });
    }
    if (!req.body.body) {
        errors.push({
            message: 'please add a description'
        });
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        Post.findOne({
                _id: req.params.id
            })
            .then(post => {

                let filename = "unknown";
                if (!isEmpty(req.files)) {
                    let file = req.files.file;
                    const path = './public/uploads/';
                    filename = Date.now() + '-' + file.name;

                    file.mv(path + filename, (err) => {
                        if (err) console.log(err);
                    });

                }
                post.user = req.user.id;
                post.title = req.body.title;
                post.status = req.body.status;
                post.allowComments = allowComments;
                post.body = req.body.body;
                post.file = filename;
                post.category = req.body.category;

                post.save().then(updatePost => {
                    req.flash('success_updated', `${updatePost.title} was updated successfully`);
                    res.redirect('/admin/posts/my-posts');
                });

            }).catch(err => {
                // TODO  catch the error
            });
    }
});

router.delete('/:id', (req, res) => {
    Post.findOne({
        _id: req.params.id
    }).populate('comments').then(post => {
        fs.unlink(uploadDir + post.file, (err) => {

            if (post.comments.length !== 0) {
                post.comments.forEach(comment => {
                    comment.remove();
                });
            }
            post.remove().then(postRemoved => {
                req.flash('success_delete', `${postRemoved.title} was deleted successfully`);
                res.redirect('/admin/posts/my-posts');
            });
        });
    });
});

module.exports = router;