var express = require('express');
var router = express.Router();


router.get('/demo', function (req, res, next) {
    console.log(req.body);
    res.render('demo', {
        title: 'Betsy Demo',
        cellNum: ''
    })
});

router.post('/demo', function (req, res, next) {
    res.render('demo', {
            title: 'Betsy Demo',
            cellNum: req.body.tel
    })
});

router.post('/validate', function (req, res, next) {
    
})


module.exports = router;