/*jshint esversion:6*/
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Comment.find({
        user: '5db5cb32d1575e2740f46c6b'
    }).populate('user').then(comments => {

        res.render('admin/comments', {
            comments: comments
        });
    });
});

router.post('/', (req, res) => {
    Post.findOne({
        _id: req.body.id
    }).then(post => {
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                req.flash('success_message','Your comment will be updated shortly');
                res.redirect(`/post/${post.id}`);
            });
        });
    });
});
router.delete('/:id', (req, res) => {
    Comment.findOne({
        _id: req.params.id
    }).then(comment => {
        comment.remove().then(removedComment => {
            Post.findOneAndUpdate({
                comments: req.params.id
            }, {
                $pull: {
                    comments: req.params.id
                }
            }, (err, data) => {
                if (err) console.log(err);
                req.flash('success_delete', `${comment.id} was deleted successfully`);
                res.redirect('/admin/comments');
            });
        });
    });
});

router.post('/approve-comment', (req, res) => {
    Comment.findByIdAndUpdate(req.body.ID, {
        $set: {
            approveComment: req.body.approveComment
        }
    }, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    });
});
module.exports = router;