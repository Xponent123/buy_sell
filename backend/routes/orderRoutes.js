const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcrypt');



const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); 

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


router.post('/create', async (req, res) => {
    try {
        const { buyerId, sellerId, productId, amount } = req.body;

        if (!buyerId || !sellerId || !productId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        
        const otp = generateOtp();
        console.log('otp', otp);
        const hashedOtp = await hashOtp(otp);

        const order = new Order({
            buyerId,
            sellerId,
            productId,
            amount,
            hashedOtp,
        });

        await order.save();

        
        await Product.findByIdAndUpdate(productId, { sold: true });

        
        await User.updateMany(
            { cartItems: productId },
            { $pull: { cartItems: productId } }
        );
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            otp, 
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});


router.patch("/approve/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required." });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        
        const isOtpValid = await bcrypt.compare(otp, order.hashedOtp);

        if (!isOtpValid) {
            return res.status(401).json({ success: false, message: "Invalid OTP." });
        }

        
        order.pending = false;
        await order.save();

        res.status(200).json({ success: true, message: "Delivery approved successfully." });
    } catch (error) {
        console.error("Error approving delivery:", error);
        res.status(500).json({ success: false, message: "Failed to approve delivery." });
    }
});





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


router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyerId, pending: true })
            .populate('productId', 'name')
            .populate('sellerId', 'firstName lastName');

        
        
        res.status(200).json({ orders });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});



router.get("/orderhistory/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        
        const orders = await Order.find({ buyerId: userId, pending: false })
            .populate("productId", "name price description category image_URL") 
            .populate("sellerId", "firstName lastName email contactNumber") 
            .sort({ createdAt: -1 }); 

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No completed orders found." });
        }

        res.status(200).json({ success: true, orders });
    } catch (err) {
        console.error("Error fetching order history:", err);
        res.status(500).json({ success: false, error: "Failed to fetch order history." });
    }
});

























router.get("/pending/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;

        const orders = await Order.find({ sellerId, pending: true })
            .populate("productId", "name price description category image_URL")
            .populate("buyerId", "firstName lastName email");

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No pending deliveries found." });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching pending deliveries:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending deliveries." });
    }
});





router.get("/itemsYetToBeDelivered/:buyerId", async (req, res) => {
    try {
        const { buyerId } = req.params;

        
        const orders = await Order.find({ buyerId, pending: true })
            .populate("productId", "name price description category image_URL")
            .populate("sellerId", "firstName lastName");

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No items found for delivery." });
        }

        
        const ordersWithOtp = orders.map(order => ({
            ...order.toObject(),
            plainOtp: order.plainOtp || "Not Available", 
        }));
        console.log('ordersWithOtp', ordersWithOtp);

        res.status(200).json({ success: true, orders: ordersWithOtp });
    } catch (error) {
        console.error("Error fetching items yet to be delivered:", error);
        res.status(500).json({ success: false, message: "Failed to fetch items." });
    }
});








router.post('/regenerate-otp/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        
        const newOtp = generateOtp();
        const newHashedOtp = await hashOtp(newOtp);

        
        order.hashedOtp = newHashedOtp;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'OTP regenerated successfully',
            otp: newOtp
        });
    } catch (error) {
        console.error('Error regenerating OTP:', error);
        res.status(500).json({ error: 'Failed to regenerate OTP' });
    }
});






module.exports = router;

