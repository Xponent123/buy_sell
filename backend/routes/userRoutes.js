
const express = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const router = express.Router();
const mongoose = require("mongoose");
const Order = require('../models/order');
const axios = require('axios');
const bcrypt = require('bcrypt');

/**
 * Add a product to the cart
 */

router.post('/logout', (req, res) => {
    try {
        
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});


router.post('/add-to-cart', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required.' });
        }

        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { cartItems: productId }, 
            },
            { new: true } 
        ).populate('cartItems'); 

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Product added to cart', cart: user.cartItems });
    } catch (err) {
        console.error('Error adding product to cart:', err);
        res.status(500).json({ error: 'Failed to add product to cart.' });
    }
});


/**
 * Get cart items
 */
router.get('/cart/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'cartItems',
                populate: {
                    path: 'sellerId',
                    select: 'firstName lastName'
                },
                select: 'name price description category sellerId sold image_URL'
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        
        if (!user.cartItems) {
            return res.status(200).json({ cartItems: [] });
        }

        
        res.status(200).json({ cartItems: user.cartItems });
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ error: 'Failed to fetch cart items.' });
    }
});


router.delete('/cart/clear/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        


        
        user.cartItems = [];
        await user.save();

        res.json({ success: true, message: 'Cart cleared successfully', cart: user.cartItems });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});



router.delete('/cart/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { cartItems: productId } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Item removed from cart successfully' });
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});




router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password'); 
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});




router.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, age, contactNumber, oldPassword, newPassword } = req.body;

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        
        if (oldPassword && newPassword) {
            
            
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Current password is incorrect." });
            }
            
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.age = age;
        user.contactNumber = contactNumber;

        
        await user.save();

        
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

router.post('/add-seller-review/:userId', async (req, res) => {
    try {
        const { userId } = req.params; 
        const { sellerId, review, rating } = req.body;

        
        console.log('Request body:', req.body);



        
        if (!sellerId) {
            return res.status(400).json({ error: 'Seller ID, Order ID, and Product ID are required' });
        }

        
        const parsedRating = parseInt(rating, 10);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        }

        
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        
        
        
        
        

        
        seller.sellerReviews.push({
            
            reviewerId: userId, 
            
            review: review || '',
            rating: parsedRating,
            createdAt: new Date()
        });

        
        await seller.save();

        res.status(200).json({
            message: 'Seller review submitted successfully',
            review: seller.sellerReviews[seller.sellerReviews.length - 1]
        });
    } catch (error) {
        console.error('Error adding seller review:', error);
        res.status(500).json({ error: 'Failed to submit review', details: error.message });
    }
});



router.get('/seller-reviews/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        
        const seller = await User.findById(sellerId)
            .populate({
                path: 'sellerReviews.reviewerId',
                select: 'firstName lastName'
            })


        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        
        const reviews = seller.sellerReviews;
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            reviews,
            averageRating: averageRating.toFixed(1),
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching seller reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});





module.exports = router;