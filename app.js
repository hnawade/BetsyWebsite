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
var usersRouter = require('./routes/screens');


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


var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'betsy-users.ca0jqdgq1i14.us-west-2.rds.amazonaws.com',
    user: 'admin',
    password: 'd3QCdpmM',
    database: 'betsy_users',
    port: 3306
})

var db_config = {
    host: 'betsy-users.ca0jqdgq1i14.us-west-2.rds.amazonaws.com',
    user: 'admin',
    password: 'd3QCdpmM',
    database: 'betsy_users',
    port: 3306
}

var db;


function handleDisconnect() {
    db = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    db.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
        console.log("connected to database")
    });                                     // process asynchronous requests in the meantime.

                                            // If you're also serving http, display a 503 error.
    db.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });

    global.db = db;
}

handleDisconnect();

// const db = mysql.createConnection({
//     host: 'betsy-users.ca0jqdgq1i14.us-west-2.rds.amazonaws.com',
//     user: 'admin',
//     password: 'd3QCdpmM',
//     database: 'betsy_users',
//     port: 3306
// });
//
// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Connected to database');
// });

global.pool = pool
global.demoNumber = "973-321-3992"


passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true //passback entire req to call back
    }, function (req, email, password, done) {
        console.log(email + ' = ' + password);
        if (!email || !password) {
            return done(null, false, req.flash('message', 'All fields are required.'));
        }

        // pool.getConnection(function (err, connection) {
        //     if (err) throw err; // not connected!
        //
        //     // Use the connection
        //     connection.query("select * from users where email = ?", [email], function (err, rows, fields) {
        //
        //         console.log(err);
        //         if (err) return done(req.flash('message', err));
        //
        //         if (!rows.length) {
        //             return done(null, false, req.flash('message', 'Invalid email.'));
        //         }
        //         var encPassword = encode(password)
        //         var dbPassword = rows[0].password;
        //
        //         if (!(dbPassword == encPassword)) {
        //             return done(null, false, req.flash('message', 'Invalid email/password combination.'));
        //         }
        //         req.session.user = rows[0];
        //         return done(null, rows[0]);
        //
        //         // When done with the connection, release it.
        //         connection.release();
        //
        //         // Handle error after the release.
        //         if (error) throw error;
        //
        //         // Don't use the connection here, it has been returned to the pool.
        //     });
        // });

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
    // pool.getConnection(function (err, connection) {
    //     if (err) throw err; // not connected!
    //
    //     // Use the connection
    //     connection.query("select * from users where user_id = ?", id, function (err, rows) {
    //
    //         done(err, rows[0]);
    //
    //         // When done with the connection, release it.
    //         connection.release();
    //
    //         // Handle error after the release.
    //         //if (error) throw error;
    //
    //         // Don't use the connection here, it has been returned to the pool.
    //     });
    // });
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
    let phone = req.body.phone.replace(/\D/g, "");

    // pool.getConnection(function(err, connection) {
    //     if (err) throw err; // not connected!
    //
    //     // Use the connection
    //     connection.query("SELECT * FROM users WHERE email = ?", email, function (err, rows, fields) {
    //
    //         if (err) {
    //             res.render('register', {
    //                 'message': err,
    //                 user: req.session.user
    //             });
    //         } else {
    //             if (rows.length == 0) {
    //                 connection.query("INSERT INTO users VALUES (0,?,?,?,?)", [email, password, org, phone], (err, rows) => {
    //                     if (err) {
    //                         res.render('register', {
    //                             'message': err,
    //                             user: req.session.user
    //                         });
    //                     } else {
    //                         res.render('register', {
    //                             message: "Success: The new user was successfully created, you may now sign in",
    //                             user: req.session.user
    //                         })
    //                     }
    //                 })
    //             } else {
    //                 res.render('register', {
    //                     message: "An account with this email already exists, would you like to reset your password?",
    //                     user: req.session.user
    //                 });
    //             }
    //         }
    //
    //
    //
    //         // When done with the connection, release it.
    //         connection.release();
    //
    //         // Handle error after the release.
    //         //if (error) throw error;
    //
    //         // Don't use the connection here, it has been returned to the pool.
    //     });
    // });

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
                    } else {
                        res.render('register', {
                            message: "Success: The new user was successfully created, you may now sign in",
                            user: req.session.user
                        })
                    }
                })
            } else {
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
