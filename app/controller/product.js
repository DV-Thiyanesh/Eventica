const events = require('../models/product.js');
const imageurl = "http://192.168.0.112:3000/static/doc/"

module.exports = function (app) {






    app.get("/merchant", function (req, res) {
        events.find().exec(function (err, events) {
            if (err) {
                console.log(err);
            }

            res.render('merchantise', {
                events: events,
                imageurl

            });

            console.log(events);
            

        });
    });


}