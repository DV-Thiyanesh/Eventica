const view = require('../models/product.js');
const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {

    app.get("/merchantview/:id", function (req, res) {
           var id=req.param.id;
        view.findOne(id).exec(function (err, view) {
            if (err) {
                console.log(err);
            }
              
            res.render('merchantiseview', {
                view: view,
                imageurl

            });

            console.log("view.......", view);
            

        });
    });


}