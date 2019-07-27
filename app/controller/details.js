const details = require('../models/event.js');
const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {

    app.get("/details/:id", function(req, res){
        console.log("hrrtrt", req.pARA)
        var id=req.params.id;
        details.findOne({_id: id}).exec(function (err, details) {
            if (err) {
                console.log(err);
            }
            console.log("img",details)
            res.render('details', {
                details: details,
                imageurl

            });
           
  
        });
    });

    

}