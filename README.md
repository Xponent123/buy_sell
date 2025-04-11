# IIIT Buy-Sell Website

## Project Overview

This is a dedicated Buy-Sell web application designed exclusively for the IIIT Community, created to circumvent the new Whatscap taxation policy on community buy-sell groups.

### Tech Stack
- **Frontend**: React
- **Backend**: Express.js
- **Database**: MongoDB
- **Runtime**: Node.js

## Features

### Authentication
- User registration with IIIT email validation
- Secure password hashing
- JWT-based authentication
- Persistent login session
- Optional Google Recaptcha integration
- Optional CAS Login support

### User Functionality
- Profile management
- Search and filter items
- Add items to cart
- Place and track orders
- View order history
- Seller review system

### Key Pages
1. **Dashboard**
   - User profile
   - Navigation to all main sections

2. **Search Items**
   - Case-insensitive search
   - Category-based filtering
   - Item details preview

3. **Individual Item Page**
   - Detailed item description
   - Add to cart functionality

4. **Orders History**
   - Pending orders
   - Purchase history
   - Sales history

5. **Deliver Items**
   - Seller order tracking
   - Transaction closure with OTP verification

6. **My Cart**
   - Item management
   - Total cost calculation
   - Order placement

7. **Support** (Bonus Feature)
   - AI-powered chatbot
   - Session-based conversation tracking

## Prerequisites
- Node.js
- MongoDB
- npm



### Environment Variables
Create `.env` files in backend directories with:
- MongoDB connection string
- JWT Secret
- Recaptcha keys
- AI Chatbot API keys

## Security Measures
- Password hashing with bcrypt
- JWT token protection for routes
- IIIT email validation
- OTP verification for transactions

## Bonus Features
- Google Recaptcha
- CAS Login
- AI Support Chatbot


## Assumptions
- Unlimited Reviews for each Product
- User should remember OTP while placing order else regenerate OTP


## How to Run
- Install Node Modules
- Backend: navigate to backend folder; npm start
- Frontend: navigate to frontend folder; npm run dev


