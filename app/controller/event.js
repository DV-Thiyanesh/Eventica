const events = require('../models/event.js');

const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {






    app.get("/events", function (req, res) {
        events.find().exec(function (err, events) {
            if (err) {
                console.log(err);
            }
   
            res.render('events', {
             
                events: events,
                imageurl

            });

            
            console.log("events...",events);

        });
    });

    

}