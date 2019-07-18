var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('demo', {
        title: 'Demo Betsy',
        cellNum: ''
    })
});

router.post('/', function(req, res, next) {
    var cell = req.body.tel;
    res.render('demo', {
        title: 'Demo Betsy',
        cellNum: cell
    })
});


module.exports = router;