const news = require('../models/news.js');

const imageurl = "http://eventica.smartchain.in:3000/static/doc/"

module.exports = function (app) {






    app.get("/cryptonews", function (req, res) {
        news.find().exec(function (err, news) {
            if (err) {
                console.log(err);
            }

            res.render('cryptonews', {
             
                news: news,
                imageurl

            });

            
            console.log("news...",news);

        });
    });

    

}