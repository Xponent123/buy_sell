import { useContext, useEffect, useState } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import Chatbot from "./Chatbot"; 
import toast from "react-hot-toast";
import axios from "axios";
import { PlusCircle, ShoppingCart, History, PackageCheck, PackageX, User, Truck, ClipboardList } from 'lucide-react'
import './Dashboard.css';

export default function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); 
    const navigate = useNavigate(); 
    const categories = [
        "Groceries",
        "Furniture",
        "Electronics",
        "Clothing",
        "Books",
        "Home & Garden",
        "Sports & Outdoors",
        "Others"
    ];

    const reloadPage = () => {
        window.location.reload();
    };


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/products', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use correct token retrieval
                    },
                });

                if (response.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    navigate("/login"); 
                    return;
                }

                const data = await response.json();
                setProducts(data || []); 
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            }
        };

        fetchProducts();
    }, [navigate]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(cat => cat !== category)
                : [...prev, category]
        );
    };


    const handleAddToCart = async (productId) => {
        if (!user || !user.id) {
            toast.error("You must be logged in to add items to your cart.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/users/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Product added to cart successfully!');
            } else {
                toast.error(data.error || 'Failed to add product to cart.');
            }
        } catch (err) {
            console.error('Error adding product to cart:', err);
            toast.error('An error occurred while adding the product to the cart.');
        }
    };



    // const handleDelete = async (id) => {
    //     try {
    //         const response = await fetch(`http://localhost:8000/api/products/${id}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ sellerId: user.id }), // Send sellerId for validation
    //         });

    //         const data = await response.json();
    //         if (response.ok) {
    //             setProducts(products.filter((product) => product._id !== id)); // Remove from UI
    //             alert(data.message);
    //         } else {
    //             alert(data.error || "Failed to delete product");
    //         }
    //     } catch (error) {
    //         console.error("Error deleting product:", error);
    //     }
    // };

    // const handleEdit = (id) => {
    //     navigate(`/editproduct/${id}`); // Navigate to the edit page with the product ID
    // };


    const filteredProducts = products.filter((product) =>
        product.sellerId?._id !== user.id &&
        !product.sold &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategories.length === 0 || selectedCategories.includes(product.category))
    );

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout', {}, {
                withCredentials: true
            });

            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('cookie');

            navigate('/login');

            alert(response.data.message);
        } catch (error) {
            console.error('Logout failed', error);
            alert('Logout failed. Please try again.');
        }
    };

    return (
        <div className="dashboard-container">


            <div className="dashboard-header">
                <h1>Dashboard</h1>

                {!!user && (
                    <>
                        <h2>Welcome, {user.firstName}!</h2>
                       
                    </>
                )}
            </div>


            <div className="dashboard-actions">
                <div className="dashboard-card" onClick={() => navigate('/addproduct')}>
                    <PlusCircle size={32} color="#5b6eff" />
                    <h3>Add Product</h3>
                    <p>Easily list a new product to showcase and sell to your customers.</p>
                </div>

                <div className="dashboard-card" onClick={() => navigate(`/cart/${user?.id}`)}>
                    <ShoppingCart size={32} color="#5b6eff" />
                    <h3>My Cart</h3>
                    <p>Review and manage the items you’ve added to your shopping cart.</p>
                </div>

                <div className="dashboard-card" onClick={() => navigate(`/orderhistory/${user?.id}`)}>
                    <History size={32} color="#5b6eff" />
                    <h3>Order History</h3>
                    <p>Keep track of all your past purchases and transactions.</p>
                </div>

                {/* <div className="dashboard-card" onClick={() => navigate(`/soldproducts/${user?.id}`)}>
                    <PackageCheck size={32} color="#5b6eff" />
                    <h3>Sold Products</h3>
                    <p>View the items you’ve successfully sold to your customers.</p>
                </div> */}

                {/* <div className="dashboard-card" onClick={() => navigate(`/unsoldproducts/${user?.id}`)}>
                    <PackageX size={32} color="#5b6eff" />
                    <h3>Unsold Products</h3>
                    <p>Analyze and manage products that remain unsold in your inventory.</p>
                </div> */}

                {/* <div className="dashboard-card" onClick={() => navigate(`/profile/${user?.id}`)}>
                    <User size={32} color="#5b6eff" />
                    <h3>Profile</h3>
                    <p>Access and update your personal details and preferences.</p>
                </div> */}

                {/* <div className="dashboard-card" onClick={() => navigate(`/yettobedelivered/${user?.id}`)}>
                    <Truck size={32} color="#5b6eff" />
                    <h3>Items Yet to be Delivered (Buyer)</h3>
                    <p>Track items you’ve purchased that are on their way to you.</p>
                </div> */}

                <div className="dashboard-card" onClick={() => navigate(`/pendingorders/${user?.id}`)}>
                    <ClipboardList size={32} color="#5b6eff" />
                    <h3>Pending Orders (Seller)</h3>
                    <p>Monitor orders placed by customers that are yet to be processed.</p>
                </div>
            </div>

            <div className="dashboard-search">
                <h3>Search Products</h3>
                <div >
                    <span className="search-icon"></span>
                    <input
                        type="text"
                        placeholder="🔍 Search by product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

         
            <div className="category-filter">
                <h3>Filter by Categories:</h3>
                <div className="category-filter-buttons">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={selectedCategories.includes(category)
                                ? 'category-button selected'
                                : 'category-button'}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>



            <h3>Available Products:</h3>
            <div className="dashboard-grid">
                {filteredProducts
                    .filter((product) => product.sellerId?._id !== user.id)
                    .map((product) => (
                        !product.sold && (
                            <div key={product._id} className="product-card">
                                <div
                                    className="product-card-image-container"
                                    onClick={() => navigate(`/product/${product._id}`)}
                                >
                                    <img
                                        src={product.image_URL}
                                        alt="product"
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
                                       
                                        <p>Description:</p>
                                        <p>{product.description}</p>
                                    </div>
                                </div>

                                <button
                                    className="product-card-button"
                                    onClick={() => handleAddToCart(product._id)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        )
                    ))}
            </div>




            <div className="">
                
                <Chatbot />
            </div>
        </div>
    );
}
