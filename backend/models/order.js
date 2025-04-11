const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    hashedOtp: {
        type: String, // Keep it empty for now
        default: '',
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    pending: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
