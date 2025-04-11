const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        
    },
    age: {
        type: Number,
        min: 18, 
        required: true,
    },
    contactNumber: {
        type: String,
        match: [/^\d{10}$/, 'Contact number must be a 10-digit number'], 
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cartItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product', 
            default: [], 
        },
    ],
    sellerReviews: [
        {
            reviewerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            review: {
                type: String,
                default: ''
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

module.exports = User;
