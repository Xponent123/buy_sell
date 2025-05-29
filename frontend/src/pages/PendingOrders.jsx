import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
import './PendingOrders.css'; // We will revamp this CSS file
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'; // Added icons

export default function PendingDeliveries() {
    const { sellerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [otpInputs, setOtpInputs] = useState({});
    const [loading, setLoading] = useState(true);
    const [approvingOrderId, setApprovingOrderId] = useState(null); // For loading state on button

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/orders/pending/${sellerId}`);
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    toast.error(data.message || "Failed to fetch pending orders.");
                    setOrders([]); // Ensure orders is an array on failure
                }
            } catch (error) {
                console.error("Error fetching pending orders:", error);
                toast.error("An error occurred while fetching pending orders.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchOrders();
        } else {
            setLoading(false);
            toast.error("Seller ID is missing.");
        }
    }, [sellerId]);

    const handleApproveDelivery = async (orderId) => {
        setApprovingOrderId(orderId);
        try {
            const otp = otpInputs[orderId];
            if (!otp || otp.trim() === "") {
                toast.error("Please enter the OTP.");
                setApprovingOrderId(null);
                return;
            }
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
                toast.success("Delivery approved successfully!");
            } else {
                toast.error(data.message || "Failed to approve delivery.");
            }
        } catch (error) {
            console.error("Error approving delivery:", error);
            toast.error("Failed to approve delivery. Please try again.");
        } finally {
            setApprovingOrderId(null);
        }
    };

    if (loading) {
        return (
            <div className="page-loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading pending deliveries...</p>
            </div>
        );
    }

    return (
        <div className="pending-orders-page-container">
            <div className="pending-orders-header">
                <h1>Pending Deliveries</h1>
                <p>Manage and approve orders awaiting delivery confirmation.</p>
            </div>

            {orders.length > 0 ? (
                <ul className="pending-orders-list">
                    {orders.map(order => (
                        <li key={order._id} className="pending-order-card">
                            <div className="pending-order-card-image-wrapper">
                                <img
                                    src={order.productId?.image_URL || '/placeholder-image.png'} // Fallback image
                                    alt={order.productId?.name || 'Product Image'}
                                    className="pending-order-card-image"
                                />
                            </div>
                            
                            <div className="pending-order-card-content">
                                <h3 className="pending-order-card-product-name">{order.productId?.name || 'Product Name N/A'}</h3>
                                
                                <div className="pending-order-card-details">
                                    <p><strong>Price:</strong> ₹{order.productId?.price !== undefined ? order.productId.price : 'N/A'}</p>
                                    <p><strong>Buyer:</strong> {order.buyerId?.firstName || 'N/A'} {order.buyerId?.lastName || ''}</p>
                                    <p><strong>Email:</strong> {order.buyerId?.email || 'N/A'}</p>
                                    {/* <p><strong>Contact:</strong> {order.buyerId?.contactNumber || 'N/A'}</p> */}
                                </div>

                                <div className="pending-order-card-otp-section">
                                    <input
                                        type="text"
                                        className="otp-input"
                                        placeholder="Enter Delivery OTP"
                                        value={otpInputs[order._id] || ""}
                                        onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                                    />
                                    <button
                                        className="approve-delivery-button"
                                        onClick={() => handleApproveDelivery(order._id)}
                                        disabled={!otpInputs[order._id] || approvingOrderId === order._id}
                                    >
                                        {approvingOrderId === order._id ? (
                                            <Loader2 className="animate-spin inline-block mr-2" size={16} />
                                        ) : (
                                            <CheckCircle className="inline-block mr-2" size={16} />
                                        )}
                                        {approvingOrderId === order._id ? 'Approving...' : 'Approve Delivery'}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-pending-orders">
                    <AlertCircle size={48} className="mb-4" />
                    <h2>No Pending Deliveries</h2>
                    <p>You currently have no orders awaiting delivery confirmation.</p>
                </div>
            )}
            <div className="dashboard-button-container-pending">
                <Link to="/dashboard" className="go-to-dashboard-link">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}