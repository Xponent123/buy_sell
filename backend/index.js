const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const session = require('express-session');
const CASAuthentication = require('cas-authentication');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const { comparePassword } = require('./helpers/auth');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: false });
const bcrypt = require('bcrypt');


const app = express();
app.use(express.json());


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/', authRoutes); 
app.use('/api/chatbot', chatbotRoutes);

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
    console.log('MongoDB connected successfully');
});



app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));


const cas = new CASAuthentication({
    cas_url: 'https://login.iiit.ac.in/cas', 
    service_url: 'http://localhost:8000',
    cas_version: '3.0',
    renew: false,
    is_dev_mode: false,
    dev_mode_user: '',
    dev_mode_info: {},
    session_name: 'cas_user',
    session_info: 'cas_userinfo',
    destroy_session: false
});



app.get('/cas/login', cas.bounce, async (req, res) => {
    try {
      
        const userInfo = req.session.cas_userinfo;
        

        const email = userInfo['e-mail'];
        const uid = userInfo.uid;
        const name = userInfo.name;
        
        console.log('CAS response:', userInfo);

        let user = await User.findOne({ email });
        
        if (!user) {
           
            const registrationData = encodeURIComponent(JSON.stringify({
                email: email,
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1] || '', 
            }));
            
            return res.redirect(`http://localhost:5173/register?data=${registrationData}`);
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

     
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

     
        const userData = encodeURIComponent(JSON.stringify({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            contactNumber: user.contactNumber
        }));

        res.redirect(`http://localhost:5173/login?token=${token}&userData=${userData}`);

    } catch (error) {
        console.error('Authentication error:', error);
        console.error(error.stack);
        res.redirect('http://localhost:5173/login?error=auth_failed');
    }
});


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

app.get('/cas/logout', (req, res) => {
  
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }

   
        console.log('token', req.cookies.token);
        res.clearCookie('token');
        res.clearCookie('userData');
        console.log('logging out');
        console.log('token', req.cookies.token);

        const casLogoutUrl = 'https://login.iiit.ac.in/cas/logout';

        const serviceUrl = encodeURIComponent('http://localhost:5173/login');
        res.redirect(`${casLogoutUrl}?service=${serviceUrl}`);
    });
});


// Start Server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));