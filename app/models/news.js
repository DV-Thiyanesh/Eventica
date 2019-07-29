const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
    newsTitle: String,
    newsWriter: String,
    newsType: String,
    newsDate: Date,
    description: String,
    newsLink: String,
    proimg: String
});
module.exports = mongoose.model('News', newsSchema)
