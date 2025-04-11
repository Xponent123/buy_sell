const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helpers/auth')
const axios = require("axios");
const jwt = require('jsonwebtoken');

JWT_SECRET = '5254236452145'
const RECAPTCHA_SECRET_KEY = "6Lfe08IqAAAAAKCDOZYnmk0JkzGOyADqpO2uCqH5"; 



const test = (req, res) => {
    res.json('Test is successful')
}
















const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, contactNumber } = req.body;

        
        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!email.endsWith('@iiit.ac.in') && !email.endsWith('@research.iiit.ac.in') && !email.endsWith('@students.iiit.ac.in')) {
            return res.status(400).json({ error: 'Email must be an IIIT email (@iiit.ac.in)' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        if (!age || age < 18) {
            return res.status(400).json({ error: 'Age must be at least 18' });
        }
        if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
            return res.status(400).json({ error: 'Contact number must be a valid 10-digit number' });
        }

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        
        const hashedPassword = await hashPassword(password);

        
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            age,
            contactNumber,
        });

        await user.save();

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                contactNumber: user.contactNumber,
                cartItems: user.cartItems,
                sellerReviews: user.sellerReviews,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
















































const loginUser = async (req, res) => {
    try {
        const { email, password, captchaToken } = req.body;

        
        if (!captchaToken) {
            return res.status(400).json({ error: "Captcha token is missing" });
        }

        
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: captchaToken,
                },
            }
        );

        
        const { success, score } = recaptchaResponse.data;
        if (!success || score < 0.5) {
            return res.status(400).json({ error: "Failed reCAPTCHA verification" });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: 'Invalid credentials' });
        }

        
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.json({ error: 'Invalid credentials' });
        }
         
         const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        });

        
        return res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

       
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const logout = async (req, res) => {
    try {
        
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        return res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        
        res.json(req.user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { 
    test, 
    registerUser, 
    loginUser, 
    logout,
    requireAuth,
    getProfile
};
