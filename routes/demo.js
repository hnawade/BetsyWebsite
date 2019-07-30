var express = require('express');
var router = express.Router();


router.get('/demo', function (req, res, next) {
    res.render('demo', {
        title: 'Betsy Demo',
        name: '',
        email: '',
        cellNum: '',
        code: null,
        user: req.session.user
    })
});

router.post('/demo', function (req, res, next) {
    res.render('demo', {
        title: 'Betsy Demo',
        name: '',
        email: '',
        cellNum: req.body.tel,
        code: null,
        user: req.session.user
    })
});

router.post('/validate', function(req, res, next) {
    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-west-2'});

    console.log("Generating code");
    var code = Math.floor(Math.random() * 9000 + 1000);
    console.log("Code = " + code);
    console.log(req.body);
    console.log('+1001' + req.body.cell.replace(/\D/g, ""));

    var params = {
        Message: 'Your verification code is ' + code, /* required */
        PhoneNumber: '+1001' + req.body.cell.replace(/\D/g, "")
    };

    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    publishTextPromise.then(
        function (data) {
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });

    res.render('demo', {
        title: 'Betsy Demo',
        name: req.body.name,
        email: req.body.email,
        cellNum: req.body.cell,
        code: code,
        user: req.session.user
    })
})

module.exports = router;