
const express = require('express');
const Product = require('../models/product');
const Order = require('../models/order');
const router = express.Router();
const mongoose = require("mongoose");





router.post('/add', async (req, res) => {
    try {
        const { name, price, description, category, sellerId,image_URL } = req.body;

        
        if (!name || !price || !category || !sellerId || !description || !image_URL) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        
        const product = new Product({
            name,
            price,
            description,
            category,
            sellerId,
            image_URL,
        });

        await product.save(); 
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add product' });
    }
});





router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('sellerId', 'firstName lastName'); 
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});




router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('sellerId', 'firstName lastName');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});


router.get('/sold/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        
        const orders = await Order.find({ sellerId, pending: false })
            .populate('productId', 'name price category description image_URL updatedAt')
            .populate('buyerId', 'firstName lastName');

        
        const soldProducts = orders.map(order => ({
            ...order.productId.toObject(),  
            buyer: order.buyerId, 
            soldOn: order.updatedAt, 
        }));

        
        res.status(200).json({ success: true, products: soldProducts });
        
    } catch (error) {
        console.error('Error fetching sold products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sold products.' });
    }
});



router.get('/unsold/:sellerId', async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.params.sellerId, sold: false });

        if (!products || products.length === 0) {
            return res.status(404).json({ success: true, message: 'No unsold products found.' });
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching unsold products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch unsold products.' });
    }
});




router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sellerId, name, price, description, category,image_URL } = req.body;
        
        

        const product = await Product.findById(id);
        

        if (!product) {
            
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerId.toString() !== sellerId) {
            return res.status(403).json({ error: 'Unauthorized to update this product' });
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.image_URL = image_URL || product.image_URL;


        await product.save();
       
        res.json({ message: 'Product updated successfully', product });
    } catch (err) {
        console.error(err);
      
        res.status(500).json({ error: 'Failed to update product' });
    }
});





router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { sellerId } = req.body; 
        
        

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        
        
        if (product.sellerId.toString() !== sellerId) {
            return res.status(403).json({ error: 'Unauthorized to delete this product' });
        }

        
        await Product.deleteOne({ _id: id }); 
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


router.get("/product/:productId", async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate("sellerId", "firstName lastName email contactNumber");
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ product });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ error: "Failed to fetch product details" });
    }
});




module.exports = router;
