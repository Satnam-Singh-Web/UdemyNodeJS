/*jshint esversion:6*/
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const {userAuthenticated}=require('../../helpers/authentication');


router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/categories', {
            categories: categories
        });
    }).catch(err => {
        // TODO  catch the error
    });
});
router.post('/create', (req, res) => {
    const newCategory = new Category({
        name: req.body.name
    });
    newCategory.save().then(savedCategory => {
        res.redirect('/admin/categories');
    });
});

router.get('/edit/:id', (req, res) => {

    Category.findOne({
            _id: req.params.id
        })
        .then(category => {
            res.render('admin/categories/edit', {
                category: category
            });
        }).catch(err => {
            // TODO  catch the error
        });
});
router.put('/edit/:id', (req, res) => {
    // if (!req.body.name) {
    //     console.log(`I am here ${req.body.name}`);
    // } else {
        Category.findOne({
                _id: req.params.id
            })
            .then(category => {
                category.name = req.body.name;
                category.save().then(updateCategory => {
                    req.flash('success_updated', `${updateCategory.name} was updated successfully`);
                    res.redirect('/admin/categories');
                });
            }).catch(err => {
                // TODO  catch the error
            });
  //}
});
router.delete('/:id', (req, res) => {
    Category.findOne({
        _id: req.params.id
    }).then(category => {
            req.flash('success_delete', `${category.name} was deleted successfully`);
            category.remove();
            res.redirect('/admin/categories');
    });
});



module.exports = router;