const express = require('express');
const router = express.Router();
const cors = require('cors');
const { 
    test, 
    registerUser, 
    loginUser, 
    logout,
    requireAuth,
    getProfile 
} = require('../controllers/authController');


router.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile',getProfile)
router.post('/logout', logout);
router.get('/profile', requireAuth, getProfile);





module.exports = router;