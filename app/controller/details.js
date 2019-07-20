const details = require('../models/event.js');
const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {

    app.get("/details/:id", function(req, res){
        var id=req.param.id;
        details.findOne(id).exec(function (err, details) {
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