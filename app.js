var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var demoRouter = require('./routes/demo');
var usersRouter = require('./routes/users');

var app = express();

var AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// Create publish parameters
var params = {
    Message: 'TEXT_MESSAGE', /* required */
    PhoneNumber: '+10016096471266',
};

// // Create promise and SNS service object
// var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
//
// // Handle promise's fulfilled/rejected states
// publishTextPromise.then(
//     function (data) {
//         console.log("MessageID is " + data.MessageId);
//     }).catch(
//     function (err) {
//         console.error(err, err.stack);
//     });


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
