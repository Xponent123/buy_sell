import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";  
import './Cart.css';

export default function Cart() {
    const { user } = useContext(UserContext);
    const [cartItems, setCartItems] = useState([]);
    const { userId } = useParams(); 
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);


    const handleBuyAll = async () => {
        try {
            setProcessing(true);
            const failedOrders = [];
            const successfulOrders = [];
            const otps = [];
    
           
            for (const item of cartItems) {
                try {
                    const response = await fetch('http://localhost:8000/api/orders/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            buyerId: userId,
                            sellerId: item.sellerId._id,
                            productId: item._id,
                            amount: item.price,
                        }),
                    });
    
                    const result = await response.json();
                    if (result.success) {
                        successfulOrders.push(item._id);
                        otps.push({ 
                            productId: item._id, 
                            productName: item.name, 
                            otp: result.otp,
                            orderId: result.orderId 
                        });
                        
                        toast.success(`${item.name}: OTP - ${result.otp}`);
                    } else {
                        failedOrders.push(item.name || 'Unknown Product');
                    }
                } catch (error) {
                    failedOrders.push(item.name || 'Unknown Product');
                    console.error('Order creation failed for:', item.name, error);
                }
            }
    
            if (successfulOrders.length > 0) {
                const storedOtps = JSON.parse(localStorage.getItem("productOtps")) || [];
                localStorage.setItem("productOtps", JSON.stringify([...storedOtps, ...otps]));
    
                const updatedCart = await fetch(`http://localhost:8000/api/users/cart/${userId}`);
                const data = await updatedCart.json();
                if (updatedCart.ok) {
                    setCartItems(data.cartItems);
                }
    
                toast.success(`Successfully purchased ${successfulOrders.length} items!`);
            }
    
            if (failedOrders.length > 0) {
                toast.error(
                    `Failed to purchase: ${failedOrders.join(', ')}`
                );
            }
        } catch (error) {
            console.error('Error processing purchases:', error);
            toast.error('Failed to process purchase.');
        } finally {
            setProcessing(false);
        }
    };



    const buyAllButton = cartItems.length > 0 && (
        <button
            onClick={handleBuyAll}
            disabled={processing}

        >
            {processing ? 'Processing...' : 'Place Order'}
        </button>
    );


    const handleDeleteItem = async (productId) => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/users/cart/${userId}/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setCartItems(cartItems.filter(item => item._id !== productId));
                toast.success('Item removed from cart');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to remove item from cart');
        }
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/api/users/cart/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setCartItems(data.cartItems);
                } else {
                    toast.error(data.error || 'Failed to fetch cart items.');
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
                toast.error('Failed to fetch cart items.');
            } finally {
                setLoading(false);
            }
        };

        if (userId && (!user || user.id === userId)) {
            fetchCartItems();
        } else if (!userId) {
            toast.error('User ID is required');
        } else if (user && user.id !== userId) {
            toast.error('Unauthorized access');
        }
    }, [userId, user]);

    if (loading) {
        return <div>Loading cart items...</div>;
    }

    if (!user) {
        return <div>Please log in to view your cart.</div>;
    }

    if (user.id !== userId) {
        return <div>Unauthorized access</div>;
    }

    return (
        <div className="main-container">
            <div className="cart-container">
               


                <h1>Your Cart</h1>
                {cartItems.length > 0 ? (
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item">
                            <div className="product-image">
                                <img
                                    src={item.image_URL}
                                    alt={item.name}
                                    className="product-image"
                                />
                            </div>
                            <h3 className="product-card-name">{item.name}</h3>
                            <div className="product-details">
                                <div className="product-details-grid">
                                    <p>Price:</p>
                                    <p>${item.price}</p>
                                    <p>Category:</p>
                                    <p>{item.category}</p>
                                    <p>Description:</p>
                                    <p>{item.description}</p>
                                    <p>Seller:</p>
                                    <p>{item.sellerId?.firstName} {item.sellerId?.lastName || "Unknown Seller"}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteItem(item._id)}>
                                Remove from Cart
                            </button>
                        </div>
                        ))}
                        <div className="cart-main">
                            <div className="cart-summary">
                                <h3>Cart Summary</h3>
                                <p>Total Items: {cartItems.length}</p>
                                <p>Total Price: ${cartItems.reduce((total, item) => total + item.price, 0).toFixed(2)}</p>
                                {buyAllButton}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <button onClick={() => window.location.href = '/dashboard'}>
                            Continue Shopping
                        </button>
                    </div>
                )}
                <div className="go-to-dashboard11">
                    <Link
                        to="/dashboard"

                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>


    );
}