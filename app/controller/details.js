const details = require('../models/event.js');
const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {

    app.get("/details/:id", function(req, res){
        details.findById(req.params.id).exec(function (err, details) {
            if (err) {
                console.log(err);
            }
            res.render('details', {
                details: details,
                imageurl

            });
            console.log("details.....", details);

        });
    });

    

}