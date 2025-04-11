const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcrypt');


// Generate and hash OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

const hashOtp = (otp) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) return reject(err);
            bcrypt.hash(otp, salt, (err, hash) => {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
};

// Create Order with OTP
router.post('/create', async (req, res) => {
    try {
        const { buyerId, sellerId, productId, amount } = req.body;

        if (!buyerId || !sellerId || !productId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate and hash OTP
        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);

        const order = new Order({
            buyerId,
            sellerId,
            productId,
            amount,
            hashedOtp,
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            otp, // Send plain OTP to the buyer
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// Approve Order by Verifying OTP
router.post('   orderId', async (req, res) => {
    try {
        const { otp } = req.body;
        const { orderId } = req.params;

        if (!otp) {
            return res.status(400).json({ error: 'OTP is required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, order.hashedOtp);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Update pending status and mark product as sold
        order.pending = false;
        await order.save();

        // Update product's sold status
        await Product.findByIdAndUpdate(order.productId, { sold: true });

        res.status(200).json({ success: true, message: 'Order approved successfully!' });
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ success: false, error: 'Failed to approve order' });
    }
});

// module.exports = router;


// Fetch pending orders for a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const orders = await Order.find({ sellerId, pending: true })
            .populate('productId', 'name')
            .populate('buyerId', 'firstName lastName');
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ error: 'Failed to fetch pending orders.' });
    }
});

// Fetch pending orders for a buyer
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyerId, pending: true })
            .populate('productId', 'name')
            .populate('sellerId', 'firstName lastName');

        console.log('orders', orders);
        console.log('buyerId', buyerId);
        res.status(200).json({ orders });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});

// // Approve a pending order
// router.patch('/approve/:orderId', async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found.' });
//         }

//         // Mark the order as approved
//         order.pending = false;
//         await order.save();

//         // Mark the product as sold
//         await Product.findByIdAndUpdate(order.productId, { sold: true });

//         res.status(200).json({ success: true, message: 'Order approved successfully.' });
//     } catch (error) {
//         console.error('Error approving order:', error);
//         res.status(500).json({ success: false, message: 'Failed to approve the order.' });
//     }
// });

// Get pending orders for a seller
router.get('/pending/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        console.log('sellerId', sellerId);

        const orders = await Order.find({ sellerId, pending: true })
            .populate('buyerId', 'firstName lastName')
            .populate('productId', 'name');
        console.log('orders', orders);
        console.log('sellerId', sellerId);

        if (!orders || orders.length === 0 || orders === null) {
            return res.status(404).json({ success: true, message: 'No pending orders found.' });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending orders.' });
    }
});





module.exports = router;