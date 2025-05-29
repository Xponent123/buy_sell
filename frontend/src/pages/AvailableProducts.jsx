import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import './AvailableProducts.css'; // We'll create this CSS file

export default function AvailableProducts() {
    const { user } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMyProducts, setShowMyProducts] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        "Groceries", "Furniture", "Electronics", "Clothing", 
        "Books", "Home & Garden", "Sports & Outdoors", "Others"
    ];

    // Effect to update searchQuery from URL on initial load or URL change
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchFromUrl = params.get('search');
        if (searchFromUrl) {
            setSearchQuery(decodeURIComponent(searchFromUrl));
        } else {
            // Optional: clear search query if no param, or maintain current state
            // setSearchQuery(""); 
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
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
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error(`Failed to fetch products: ${error.message}`);
                setProducts([]);
            } finally {
                setLoadingProducts(false);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Product added to cart successfully!');
            } else {
                toast.error(data.error || 'Failed to add product to cart.');
            }
        } catch (err) {
            toast.error('An error occurred while adding the product to the cart.');
        }
    };

    const filteredProducts = products.filter((product) =>
        (showMyProducts ? product.sellerId?._id === user?.id : true) && // Simpler logic for showMyProducts
        !product.sold &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategories.length === 0 || selectedCategories.includes(product.category))
    );
    
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        // Update URL without navigation to reflect current search state (optional)
        // navigate(`/products?search=${encodeURIComponent(e.target.value)}`, { replace: true });
    };


    return (
        <div className="available-products-container">
            <header className="available-products-header">
                <h1>Available Products</h1>
                <p>Browse, search, and filter products exclusively available for IIITH students.</p>
            </header>

            <div className="products-controls-bar">
                <div className="products-search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Search products by name..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                </div>
                <div className="products-show-my-products-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={showMyProducts}
                            onChange={() => setShowMyProducts(prev => !prev)}
                        />
                        Show My Products Only
                    </label>
                </div>
            </div>
            
            <div className="products-category-filter">
                <h3>Filter by Categories:</h3>
                <div className="products-category-filter-buttons">
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

            <div className="products-grid">
                {loadingProducts ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-text medium"></div>
                            <div className="skeleton-text short"></div>
                            <div className="skeleton-text"></div>
                            <div className="skeleton-button"></div>
                        </div>
                    ))
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="product-card">
                            <div
                                className="product-card-image-container"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                <img
                                    src={product.image_URL}
                                    alt={product.name}
                                    className="product-card-image"
                                />
                            </div>
                            <div className="product-card-name">{product.name}</div>
                            <div className="product-card-details">
                                <div className="product-card-details-grid">
                                    <p>Price:</p><p>₹{product.price}</p>
                                    <p>Category:</p><p>{product.category}</p>
                                    <p>Description:</p><p>{product.description}</p>
                                </div>
                            </div>
                            <button
                                className="product-card-button"
                                onClick={() => handleAddToCart(product._id)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-products-found">No products found matching your criteria.</p>
                )}
            </div>
        </div>
    );
}
