const product = require('../models/product.js');
const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {






    app.get("/merchant", function (req, res) {
        product.find().exec(function (err, product) {
            if (err) {
                console.log(err);
            }
              
            res.render('merchantise', {
                product: product,
                imageurl

            });

            console.log(product);
            

        });
    });


}