const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    user_id: String,
    company: String
})

module.exports = mongoose.model('products', productSchema);
