var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mysql = require('mysql');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('connect-flash');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var sess = require('express-session');
var Store = require('express-session').Store;


var app = express();

var indexRouter = require('./routes/index');
var demoRouter = require('./routes/demo');
var usersRouter = require('./routes/users');


var BetterMemoryStore = require('session-memory-store')(sess);

var store = new BetterMemoryStore({expires: 60 * 60 * 1000, debug: true});

app.use(sess({
    name: 'JSESSION',
    secret: 'MYSECRETISVERYSECRET',
    store: store,
    resave: true,
    saveUninitialized: true
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


const db = mysql.createConnection({
    host: 'betsy-users.ca0jqdgq1i14.us-west-2.rds.amazonaws.com',
    user: 'admin',
    password: 'd3QCdpmM',
    database: 'betsy_users',
    port: 3306
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

global.db = db;


passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true //passback entire req to call back
    }, function (req, email, password, done) {
        console.log(email + ' = ' + password);
        if (!email || !password) {
            return done(null, false, req.flash('message', 'All fields are required.'));
        }
        db.query("select * from users where email = ?", [email], function (err, rows) {
            console.log(err);
            if (err) return done(req.flash('message', err));

            if (!rows.length) {
                return done(null, false, req.flash('message', 'Invalid email.'));
            }
            var encPassword = encode(password)
            var dbPassword = rows[0].password;

            if (!(dbPassword == encPassword)) {
                return done(null, false, req.flash('message', 'Invalid email/password combination.'));
            }
            req.session.user = rows[0];
            return done(null, rows[0]);
        });
    }
));

function encode(password) {
    var salt = 'p5ECyTjwAq4REbvJgGk7LRbPNdC3v48aYV2T4L9C';
    salt = salt + '' + password;
    return crypto.createHash('sha256').update(salt).digest('hex');
}


passport.serializeUser(function (user, done) {
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    db.query("select * from users where user_id = ?", id, function (err, rows) {
        done(err, rows[0]);
    });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', demoRouter);
app.use('/users', usersRouter);


app.get('/signin', function (req, res) {
    res.render('login', {user: req.session.user, 'message': req.flash('message')});
});

app.post("/signin", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}), function (req, res, info) {
    res.render('login', {user: req.session.user, 'message': req.flash('message')});
});

app.get('/register', function (req, res) {
    res.render('register', {user: req.session.user, 'message': req.flash('message')});
});

app.post("/register", function (req, res, info) {
    let email = req.body.email;
    let password = encode(req.body.password);
    let org = req.body.organization;
    let phone = req.body.phone;

    db.query("SELECT * FROM users WHERE email = ?", email, (err, rows) => {
        if (err) {
            res.render('register', {
                'message': err,
                user: req.session.user
            });
        } else {
            if (rows.length == 0) {
                db.query("INSERT INTO users VALUES (0,?,?,?,?)", [email, password, org, phone], (err, rows) => {
                    if (err) {
                        res.render('register', {
                            'message': err,
                            user: req.session.user
                        });
                    }
                    else {
                        res.render('register', {
                            message: "Success: The new user was successfully created, you may now sign in",
                            user: req.session.user
                        })
                    }
                })
            }
            else {
                res.render('register', {
                    message: "An account with this email already exists, would you like to reset your password?",
                    user: req.session.user
                });
            }
        }
    })
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/signin');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
