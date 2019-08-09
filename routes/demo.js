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

router.post('/start_demo', function(req, res, next) {
    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-west-2'});

    var SNS_TOPIC_ARN = "arn:aws:sns:us-west-2:993137647083:ThisIsBetsy"



    var to_number ='+1001' + req.body.cell.replace(/\D/g, "")

    var sns = new AWS.SNS();


    sns.subscribe({
        Protocol: 'sms',
        //You don't just subscribe to "news", but the whole Amazon Resource Name (ARN)
        TopicArn: SNS_TOPIC_ARN,
        Endpoint: to_number
    }, function (err, data) {
      if (err) {
          console.error(err, err.stack)
      }
      else {
          console.log("subscribe data", data)

          var SubscriptionArn = data.SubscriptionArn;

          var params = {
              TargetArn: SNS_TOPIC_ARN,
              Message: 'Thank you for accessing the Betsy demo please call the following number: ' + demoNumber, /* required */
          };

          sns.publish(params, function(err_publish, data) {
              if (err_publish) {
                  console.log("Error sending message", err_publish)
              }
              else {
                  console.log("Sent message:", data.MessageId)
              }
              var params = {
                  SubscriptionArn: SubscriptionArn
              };

              sns.unsubscribe(params, function(err, data) {
                  if (err) {
                      console.log("err when unsubscribe", err);
                  } else {
                      console.log("Success")
                  }
              });
          })
      }
    })

    /*var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    publishTextPromise.then(
        function (data) {
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });*/

    res.render('demo', {
        title: 'Betsy Demo',
        name: req.body.name,
        email: req.body.email,
        cellNum: req.body.cell,
        code: code,
        user: req.session.user
    })
    res.redirect('/');
})

router.post('/validate', function(req, res, next) {
    var AWS = require('aws-sdk');
    AWS.config.update({region: 'us-west-2'});

    console.log("Generating code");
    var code = Math.floor(Math.random() * 9000 + 1000);
    console.log("Code = " + code);
    console.log(req.body);
    console.log('+1001' + req.body.cell.replace(/\D/g, ""));

    var sns = new AWS.SNS();
    var to_number ='+1001' + req.body.cell.replace(/\D/g, "")

    var SNS_TOPIC_ARN = "arn:aws:sns:us-west-2:993137647083:ThisIsBetsy"

    sns.subscribe({
        Protocol: 'sms',
        //You don't just subscribe to "news", but the whole Amazon Resource Name (ARN)
        TopicArn: SNS_TOPIC_ARN,
        Endpoint: to_number
    }, function (err, data) {
        if (err) {
            console.error(err, err.stack)
        }
        else {
            console.log("subscribe data", data)

            var SubscriptionArn = data.SubscriptionArn;

            var params = {
                TargetArn: SNS_TOPIC_ARN,
                Message: 'Your verification code is ' + code, /* required */
            };

            sns.publish(params, function(err_publish, data) {
                if (err_publish) {
                    console.log("Error sending message", err_publish)
                }
                else {
                    console.log("Sent message:", data.MessageId)
                }
                var params = {
                    SubscriptionArn: SubscriptionArn
                };

                sns.unsubscribe(params, function(err, data) {
                    if (err) {
                        console.log("err when unsubscribe", err);
                    } else {
                        console.log("Success")
                    }
                });
            })
        }
    })


    // var params = {
    //     Message: 'Your verification code is ' + code, /* required */
    //     PhoneNumber: '+1001' + req.body.cell.replace(/\D/g, "")
    // };
    //
    // var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    //
    // publishTextPromise.then(
    //     function (data) {
    //         console.log("MessageID is " + data.MessageId);
    //     }).catch(
    //     function (err) {
    //         console.error(err, err.stack);
    //     });

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