import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './PendingOrders.css';
import toast from 'react-hot-toast';

export default function PendingDeliveries() {
    const { sellerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [otpInputs, setOtpInputs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/orders/pending/${sellerId}`);
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching pending orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [sellerId]);

    const handleApproveDelivery = async (orderId) => {
        try {
            const otp = otpInputs[orderId];
            const response = await fetch(`http://localhost:8000/api/orders/approve/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ otp }),
            });

            const data = await response.json();
            if (data.success) {
                setOrders(orders.filter(order => order._id !== orderId));
                toast.success("Delivery approved successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error approving delivery:", error);
            toast.error("Failed to approve delivery. Please try again");
        }
    };

    if (loading) {
        return <div className="loading">Loading pending deliveries...</div>;
    }

    return (
        <div className="main-container23">
            <div className="seller-pending-deliveries-container">
                <h1>Pending Deliveries</h1>
                {orders.length > 0 ? (
                    <ul>
                        {orders.map(order => (
                            <li key={order._id}>
                                <div className="product-image-container">
                                    <img
                                        src={order.productId?.image_URL}
                                        alt={order.productId?.name}
                                        className="product-image"
                                    />
                                </div>
                                
                                <div className="product-name">{order.productId?.name}</div>
                                
                                <div className="details-grid">
                                    <p>Price:</p>
                                    <p>${order.productId?.price}</p>
                                    <p>Buyer:</p>
                                    <p>{order.buyerId?.firstName} {order.buyerId?.lastName}</p>
                                    <p>Email:</p>
                                    <p>{order.buyerId?.email}</p>
                                    {/* <p>Phone:</p>
                                    <p>{order.buyerId?.contactNumber}</p> */}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otpInputs[order._id] || ""}
                                    onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                                />
                                <button
                                    onClick={() => handleApproveDelivery(order._id)}
                                    disabled={!otpInputs[order._id]}
                                >
                                    Approve Delivery
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No pending deliveries.</p>
                )}
                <div className="dashboard-button-container">
                    <a href="/dashboard" className="go-to-dashboard">Go to Dashboard</a>
                </div>
            </div>
        </div>
    );
}