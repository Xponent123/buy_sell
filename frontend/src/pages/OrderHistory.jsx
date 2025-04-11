import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./OrderHistory.css";
import { Star } from 'lucide-react';


export default function OrderHistory() {
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState("delivered");
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [soldProducts, setSoldProducts] = useState([]);
    const [reviews, setReviews] = useState({});
    const [localOtps, setLocalOtps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({}); 

    const handleReviewChange = (orderId, field, value) => {
        setReviews(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [field]: value
            }
        }));
    };


    const handleReviewSubmit = async (orderId, sellerId) => {
        try {
            const reviewData = {
                sellerId,
                review: reviews[orderId]?.review || '',
                rating: reviews[orderId]?.rating || 0
            };

            const response = await fetch(`http://localhost:8000/api/users/add-seller-review/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Seller review submitted successfully!');
            
                setReviews(prev => ({
                    ...prev,
                    [orderId]: { review: '', rating: 0 }
                }));
            } else {
                toast.error(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('An error occurred while submitting the review');
        }
    };


    const regenerateOtp = async (orderId) => {
        try {
       
            setLoadingStates(prev => ({
                ...prev,
                [orderId]: true
            }));

            const response = await fetch(`http://localhost:8000/api/orders/regenerate-otp/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                
                const storedOtps = JSON.parse(localStorage.getItem("productOtps")) || [];
                const updatedOtps = storedOtps.map(otp =>
                    otp.orderId === orderId ? { ...otp, otp: data.otp } : otp
                );
                localStorage.setItem("productOtps", JSON.stringify(updatedOtps));

                toast.success(`New OTP generated: ${data.otp}`);
            } else {
                toast.error(data.error || 'Failed to regenerate OTP');
            }
        } catch (error) {
            console.error('Error regenerating OTP:', error);
            toast.error('An error occurred while regenerating OTP');
        } finally {
            setLoadingStates(prev => ({
                ...prev,
                [orderId]: false
            }));
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const deliveredResponse = await fetch(`http://localhost:8000/api/orders/orderhistory/${userId}`);
                const deliveredData = await deliveredResponse.json();
                if (deliveredResponse.ok || deliveredData.success || deliveredData.orders === 0 || deliveredData.orders === null || deliveredData.orders === undefined) {
                    setDeliveredOrders(deliveredData.orders || []);
                } else {
                    toast.error(deliveredData.error || "Failed to fetch delivered orders.");
                }

                const pendingResponse = await fetch(`http://localhost:8000/api/orders/itemsYetToBeDelivered/${userId}`);
                const pendingData = await pendingResponse.json();
                if (pendingData.success) {
                    setPendingOrders(pendingData.orders);
                } else {
                    console.error(pendingData.message);
                }

                const soldResponse = await fetch(`http://localhost:8000/api/products/sold/${userId}`);
                const soldData = await soldResponse.json();
                if (soldResponse.ok) {
                    setSoldProducts(soldData.products);
                } else {
                    toast.error(soldData.error || "Failed to fetch sold products.");
                }

                const storedOtps = JSON.parse(localStorage.getItem("productOtps")) || [];
                setLocalOtps(storedOtps);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("An error occurred while fetching data.");
            }
        };

        fetchOrders();
    }, [userId]);

    const getOtpForProduct = (productId) => {
        const otpEntry = localOtps.find((otp) => otp.productId === productId);
        return otpEntry?.otp || "Not Available";
    };

    const [rating, setRating] = useState(0);

    return (
        <div className="main-container">
            <div className="tabs">
                <button className={activeTab === "delivered" ? "active" : ""} onClick={() => setActiveTab("delivered")}>
                    Delivered Orders
                </button>
                <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>
                    Yet to be Delivered
                </button>
                <button className={activeTab === "sold" ? "active" : ""} onClick={() => setActiveTab("sold")}>
                    Sold Products
                </button>
            </div>

            <div className="order-container">
                {activeTab === "delivered" && (
                    <div>
                        <h1>Delivered Orders</h1>
                        <div className="dashboard-grid">
                            {deliveredOrders.map((order) => (
                                <div key={order._id} className="product-card">
                                    <div className="product-card-image-container">
                                        <img
                                            src={order.productId.image_URL}
                                            alt={order.productId.name}
                                            className="product-card-image"
                                        />
                                    </div>
                                    <div className="product-card-name">{order.productId.name}</div>
                                    <div className="product-card-details">
                                        <div className="product-card-details-grid">
                                            <p>Price:</p>
                                            <p>${order.productId.price}</p>
                                            <p>Seller:</p>
                                            <p>{order.sellerId.firstName} {order.sellerId.lastName}</p>
                                            <p>Purchased:</p>
                                            <p>{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="seller-review-section">
                                        <h4>Rate Seller</h4>
                                        <div className="rating-stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={24}
                                                    className={`star ${(reviews[order._id]?.rating || 0) >= star ? 'filled' : ''}`}
                                                    onClick={() => handleReviewChange(order._id, 'rating', star)}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            className="review-textarea"
                                            placeholder="Write your review here..."
                                            value={reviews[order._id]?.review || ''}
                                            onChange={(e) => handleReviewChange(order._id, 'review', e.target.value)}
                                        />
                                        <button
                                            className="submit-review-button"
                                            onClick={() => handleReviewSubmit(order._id, order.sellerId._id)}
                                            disabled={!reviews[order._id]?.rating || !reviews[order._id]?.review}
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "pending" && (
                    <div>
                        <h1>Yet to be Delivered</h1>
                        <div className="dashboard-grid">
                            {pendingOrders.map((order) => (
                                <div key={order._id} className="product-card">
                                    <div className="product-card-image-container">
                                        <img
                                            src={order.productId?.image_URL}
                                            alt={order.productId?.name}
                                            className="product-card-image"
                                        />
                                    </div>
                                    <div className="product-card-name">{order.productId?.name}</div>
                                    <div className="product-card-details">
                                        <div className="product-card-details-grid">
                                            <p>Price:</p>
                                            <p>${order.productId?.price}</p>
                                            <p>Seller:</p>
                                            <p>{order.sellerId?.firstName} {order.sellerId?.lastName}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="regenerate-otp-button"
                                        onClick={() => regenerateOtp(order._id)}
                                        disabled={loadingStates[order._id]}
                                    >
                                        {loadingStates[order._id] ? 'Regenerating...' : 'Regenerate OTP'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "sold" && (
                    <div>
                        <h1>Sold Products</h1>
                        <div className="dashboard-grid">
                            {soldProducts.map((product) => (
                                <div key={product._id} className="product-card">
                                    <div className="product-card-image-container">
                                        <img
                                            src={product.image_URL}
                                            alt={product.name}
                                            className="product-card-image"
                                        />
                                    </div>
                                    <div className="product-card-name">{product.name}</div>
                                    <div className="product-card-details">
                                        <div className="product-card-details-grid">
                                            <p>Price:</p>
                                            <p>${product.price}</p>
                                            <p>Category:</p>
                                            <p>{product.category}</p>
                                            <p>Sold on:</p>
                                            <p>{new Date(product.updatedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="dashboard-button">
                <a href="/dashboard">Go to Dashboard</a>
            </div>
        </div>
    );
}