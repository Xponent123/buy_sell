import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
import './YettobeDelivered.css'; // Ensure this CSS file exists and is styled
import toast from 'react-hot-toast'; // For potential error messages
import { AlertCircle, Loader2 } from 'lucide-react'; // Icons

export default function ItemsYetToBeDelivered() {
    const { buyerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [localOtps, setLocalOtps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/orders/itemsYetToBeDelivered/${buyerId}`);
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders || []); // Ensure orders is an array
                } else {
                    toast.error(data.message || "Failed to fetch items.");
                    setOrders([]);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("An error occurred while fetching items.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (buyerId) {
            fetchOrders();
        } else {
            setLoading(false);
            toast.error("Buyer ID is missing.");
        }

        // Load OTPs from local storage (if still relevant for this page)
        const storedOtps = JSON.parse(localStorage.getItem("productOtps")) || [];
        setLocalOtps(storedOtps);
    }, [buyerId]);

    const getOtpForProduct = (productId) => {
        const otpEntry = localOtps.find((otp) => otp.productId === productId);
        return otpEntry?.otp || "Check Order History"; // Updated placeholder
    };

    if (loading) {
        return (
            <div className="page-loading-container"> {/* Consistent loading state */}
                <Loader2 className="animate-spin" size={48} />
                <p>Loading your items...</p>
            </div>
        );
    }

    return (
        <div className="buyer-deliveries-page-container"> {/* Updated class */}
            <div className="buyer-deliveries-header"> {/* Added header section */}
                <h1>Items Yet to Be Delivered</h1>
                <p>Track items you've purchased that are awaiting delivery.</p>
            </div>

            {orders.length > 0 ? (
                <ul className="buyer-deliveries-list">
                    {orders.map(order => (
                        <li key={order._id} className="delivery-item-card"> {/* Card style */}
                            <div className="delivery-item-image-wrapper">
                                <img 
                                    src={order.productId?.image_URL || '/placeholder-image.png'} 
                                    alt={order.productId?.name || 'Product Image'} 
                                    className="delivery-item-image"
                                />
                            </div>
                            <div className="delivery-item-content">
                                <h3 className="delivery-item-product-name">{order.productId?.name || 'Product Name N/A'}</h3>
                                <div className="delivery-item-details">
                                    <p><strong>Price:</strong> ₹{order.productId?.price !== undefined ? order.productId.price : 'N/A'}</p>
                                    <p><strong>Seller:</strong> {order.sellerId?.firstName || 'N/A'} {order.sellerId?.lastName || ''}</p>
                                    <p><strong>Delivery OTP:</strong> <span className="otp-display">{getOtpForProduct(order.productId?._id)}</span></p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-deliveries-message"> {/* Consistent empty state */}
                    <AlertCircle size={48} className="mb-4" />
                    <h2>No Items Awaiting Delivery</h2>
                    <p>Once you purchase items, they will appear here.</p>
                </div>
            )}
            <div className="dashboard-button-container-deliveries"> {/* Consistent button container */}
                <Link to="/dashboard" className="go-to-dashboard-link">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
