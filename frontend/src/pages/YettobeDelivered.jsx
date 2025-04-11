import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
export default function ItemsYetToBeDelivered() {
    const { buyerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [localOtps, setLocalOtps] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/orders/itemsYetToBeDelivered/${buyerId}`);
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();

        const storedOtps = JSON.parse(localStorage.getItem("productOtps")) || [];
        setLocalOtps(storedOtps);
    }, [buyerId]);

    const getOtpForProduct = (productId) => {
        const otpEntry = localOtps.find((otp) => otp.productId === productId);
        return otpEntry?.otp || "Not Available";
    };

    return (
        <div className="buyer-deliveries-container">
            <h1>Items Yet to Be Delivered</h1>
            {orders.length > 0 ? (
                <ul>
                    {orders.map(order => (
                        <li key={order._id}>
                            <h3>{order.productId?.name}</h3>
                            <p>Price: ${order.productId?.price}</p>
                            <p>Seller: {order.sellerId?.firstName} {order.sellerId?.lastName}</p>
                            <p><strong>Delivery OTP:</strong> {getOtpForProduct(order.productId?._id)}</p> {/* Retrieve OTP */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No items yet to be delivered.</p>
            )}
            <div className="dashboard-button-container">
                <a href="/dashboard" className="go-to-dashboard">Go to Dashboard</a>
            </div>
        </div>
    );
}
