/*jshint esversion:6*/
const express = require('express');
const app = express();
const path = require('path');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {
    mongoDBUrl
} = require('./config/database');
const passport = require('passport');

mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    'useCreateIndex': true
}).then((db) => {
    console.log(`mongo connected`);
}).catch(err => {
    console.log(err);
});

/* Setting middleware for loading the static files*/
app.use(express.static(path.join(__dirname, 'public')));
/** helpers function */
const {
    select,
    generateTime,
    paginate
} = require('./helpers/handlebars-helpers');

/* express engine used for html layouts
 * * set the default layout to home 
 */
app.engine('handlebars', handlebars({
    defaultLayout: 'home',
    helpers: {
        select: select,
        generateTime: generateTime,
        paginate:paginate
    }
}));
// Upload Middleware
app.use(upload());

// NOTE extended true is any data where as extended false take object with keys and values
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Method Override

app.use(methodOverride('_method'));

/* Setting middleware for loading html layouts */
app.set('view engine', 'handlebars');

//? sessions
app.use(session({
    secret: '123qwe,./+_)',
    resave: true,
    saveUninitialized: true
}));

// ? flash
app.use(flash());

// ? passport
app.use(passport.initialize());
app.use(passport.session());

// local variable using middleware
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.success_update = req.flash('success_updated');
    res.locals.success_delete = req.flash('success_delete');
    res.locals.error = req.flash('error');
    next();
});



/* getting all the main routes */
const main = require('./routes/home/main');
/* using routes */
app.use('/', main);
/* getting all the admin routes */
const admin = require('./routes/admin/admin');
/* using routes */
app.use('/admin', admin);

/* getting all the post routes */
const posts = require('./routes/admin/posts');
/* using routes */
app.use('/admin/posts', posts);

/* getting all the categories routes */
const categories = require('./routes/admin/categories');
/* using routes */
app.use('/admin/categories', categories);

/* getting all the comments routes */
const comments = require('./routes/admin/comments');
/* using routes */
app.use('/admin/comments', comments);



app.listen(1234, () => {
    console.log(`Listening on port 1234`);
});