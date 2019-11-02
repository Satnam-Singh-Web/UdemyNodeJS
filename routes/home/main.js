/*jshint esversion:6*/
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const localStartegy = require('passport-local').Strategy;

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'home';
    next();
});
router.get('/', (req, res) => {
    //! session 
    //     req.session.satnam='Satnam Singh';
    //     if(req.session.satnam){
    //         console.log(`we found the session`);
    //     }
    const perPage = 10;
    const page = req.query.page || 1;
    Post.find({}).skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts => {
            Post.countDocuments().then(postCount => {

                Category.find({}).then(categories => {

                    res.render('home/index', {
                        posts: posts,
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / perPage)
                    });
                });
            });
        }).catch(err => {

        });
});


router.get('/about', (req, res) => {
    res.render('home/about');
});

router.get('/login', (req, res) => {
    res.render('home/login');
});

passport.use(new localStartegy({
    usernameField: 'email'
}, (email, password, done) => {

    User.findOne({
        email: email
    }).then(user => {
        if (!user) return done(null, false, {
            message: 'User not Found'
        });
        bcryptjs.compare(password, user.password, (err, match) => {
            //if (err) return err;
            if (match) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Incorrect password'
                });
            }
        });
    });
}));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
router.post('/login', (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        req.flash('error', `Please enter your credentials`);
        res.redirect('/login');
    } else {
        passport.authenticate('local', {
            successRedirect: '/admin',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }
});
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});
router.get('/register', (req, res) => {
    res.render('home/register');
});
router.post('/register', (req, res) => {
    let errors = [];
    if (!req.body.firstName) {
        errors.push({
            message: 'please provide first name '
        });
    }
    if (!req.body.lastName) {
        errors.push({
            message: 'please provide last name '
        });
    }
    if (!req.body.email) {
        errors.push({
            message: 'please provide an email'
        });
    }
    if (!req.body.password) {
        errors.push({
            message: 'please provide a password'
        });
    } else if (!req.body.passwordConfirm) {
        errors.push({
            message: 'please confirm password'
        });
    } else if (req.body.password !== req.body.passwordConfirm) {
        errors.push({
            message: 'password does not match'
        });
    }


    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    } else {
        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                req.flash('error_message', `Email is register with application. Please login`);
                res.redirect('/login');
            } else {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });
                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(savedUser => {
                            req.flash('success_message', 'You are now registered, please login');
                            res.redirect('/login');
                        });
                    });
                });
            }
        });

    }
});

router.get('/post/:slug', (req, res) => {
    Post.findOne({
        slug: req.params.slug
    }).populate({
        path: 'comments',
        match: {
            approveComment: true
        },
        populate: {
            path: 'user',
            model: 'users'
        }
    }).
    populate('user').then(post => {
        Category.find({}).then(categories => {
            res.render('home/post', {
                post: post,
                categories: categories
            });
        });
    });
});

module.exports = router;