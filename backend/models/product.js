
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    sold: {
        type: Boolean,
        default: false, 
    },
    image_URL: {
        type: String,
    },
}, { timestamps: true });

const Product = mongoose.model('product', productSchema);

module.exports = Product;
