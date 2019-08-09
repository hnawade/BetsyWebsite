var express = require('express');
var router = express.Router();

router.get('/screens', function(req, res, next) {
    let user = req.session.user;
    if (user == null) {
        res.redirect('/signin');
        return;
    }

    /*pool.getConnection(function(err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query("SELECT * FROM screens", user.user_id, function (err, screens, fields) {
            // When done with the connection, release it.
            if (err) {
                res.render("screens", {
                    message: err,
                    screens: [],
                    keywords: [],
                    user: req.session.user
                })
                return;
            }
            connection.query("SELECT * FROM keywords", user.user_id, (err, options) => { // k WHERE k.screen_id IN (SELECT s.screen_id FROM screens s WHERE user_id = ?)
                if (err) {
                    res.render("screens", {
                        message: err,
                        screens: screens,
                        keywords: [],
                        user: req.session.user
                    })
                    return;
                }
                res.render("screens", {
                    message: null,
                    screens: screens,
                    keywords: options,
                    user: req.session.user
                })
            })

            connection.release();

            // Handle error after the release.
            //if (error) throw error;

            // Don't use the connection here, it has been returned to the pool.
        });
    });

    */
    db.query("SELECT * FROM screens", user.user_id, (err, screens) => { // WHERE user_id = ?
        if (err) {
            res.render("screens", {
                message: err,
                screens: [],
                keywords: [],
                user: req.session.user
            })
            return;
        }
        db.query("SELECT * FROM keywords", user.user_id, (err, options) => { // k WHERE k.screen_id IN (SELECT s.screen_id FROM screens s WHERE user_id = ?)
            if (err) {
                res.render("screens", {
                    message: err,
                    screens: screens,
                    keywords: [],
                    user: req.session.user
                })
                return;
            }
            res.render("screens", {
                message: null,
                screens: screens,
                keywords: options,
                user: req.session.user
            })
        })
    })
})

module.exports = router;