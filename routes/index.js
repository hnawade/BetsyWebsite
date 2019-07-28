var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Welcome to Betsy!', user : null});
});

router.get('/about', function (req, res, next) {
    res.render('static-page', {
        title: 'About Betsy',
        content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid, suscipit, rerum quos facilis" +
            "repellat architecto commodi officia atque nemo facere eum non illo voluptatem quae delectus odit vel" +
            "itaque amet."
        , user : null
    })
})

router.get('/contact', function (req, res, next) {
    res.render('static-page', {
        title: 'Contact Us',
        content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid, suscipit, rerum quos facilis" +
            "repellat architecto commodi officia atque nemo facere eum non illo voluptatem quae delectus odit vel" +
            "itaque amet.", user : null
    })
})

module.exports = router;
