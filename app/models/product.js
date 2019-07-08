const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: String,
    productType: String,
    productBrand: String,
    productPrice: String,
    productSize: String,
    productQuantity: String,
    productUom: String,
    description: String,
    proimg: String
});
module.exports = mongoose.model('Product', productSchema)
