import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import "./Dashboard.css";
import toast from "react-hot-toast";
import axios from "axios";

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const navigate = useNavigate();

    // Predefined categories matching the AddProduct component
    const categories = [
        "Groceries",
        "Furniture", 
        "Electronics", 
        "Clothing", 
        "Books", 
        "Home & Garden", 
        "Sports & Outdoors"
    ];

    // Fetch products when the component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/products', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

    // Handle category filter toggle
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(cat => cat !== category) 
                : [...prev, category]
        );
    };

    // Filter products based on search query and selected categories
    const filteredProducts = products.filter((product) => 
        // Filter out seller's own products
        product.sellerId?._id !== user.id &&
        // Check if not sold
        !product.sold &&
        // Search query filter
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        // Category filter (if no categories selected, show all)
        (selectedCategories.length === 0 || selectedCategories.includes(product.category))
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-search">
                <h3>Search Products</h3>
                <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Filter Section */}
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
                {filteredProducts.map((product) => (
                    <div key={product._id} className="product-card">
                        <img
                            src={product.image_URL}
                            alt="product"
                            onClick={() => navigate(`/product/${product._id}`)}
                        />
                        <h4>{product.name}</h4>
                        <p>Price: ${product.price}</p>
                        <p>Category: {product.category}</p>
                        <p>Description: {product.description}</p>
                        <p>Seller: {product.sellerId?.firstName} {product.sellerId?.lastName || "Unknown Seller"}</p>
                        <button onClick={() => handleAddToCart(product._id)}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
}