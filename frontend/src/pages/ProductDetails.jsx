import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import './ProductDetails.css'; // Ensure CSS is imported

export default function ProductDetails() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/products/product/${productId}`);
                const data = await response.json();

                if (response.ok) {
                    setProduct(data.product);
                } else {
                    toast.error(data.error || "Failed to fetch product details.");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                toast.error("An error occurred while fetching the product.");
            }
        };

        fetchProductDetails();
    }, [productId]);

    if (!product) {
        return <div className="product-details-loading">Loading product details...</div>;
    }

    return (
        <div className="main-container">
            <div className="product-details-container">
                <div className="product-image-column">
                    <img src={product.image_URL} alt={product.name} className="product-details-image" />
                </div>

                <div className="product-info-column">
                    <h1 className="product-details-title">{product.name}</h1>

                    <div className="product-price-category">
                        <span className="product-price">₹{product.price}</span>
                        <span className="product-category-badge">{product.category}</span>
                    </div>

                    <div className="product-details-description">
                        <h3 className="product-details-label">Description</h3>
                        <p className="product-details-value">{product.description}</p>
                    </div>

                    <div className="product-details-seller-info">
                        <h3>Seller Information</h3>
                        <div className="seller-info-grid">
                            <div className="seller-info-item">
                                <span className="product-details-label">Name</span>
                                <p className="product-details-value">
                                    {product.sellerId?.firstName} {product.sellerId?.lastName || "N/A"}
                                </p>
                            </div>
                            <div className="seller-info-item">
                                <span className="product-details-label">Email</span>
                                <p className="product-details-value">{product.sellerId?.email || "N/A"}</p>
                            </div>
                            <div className="seller-info-item">
                                <span className="product-details-label">Contact</span>
                                <p className="product-details-value">{product.sellerId?.contactNumber || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="product-details-back-btn-container">
                        <button
                            className="product-details-back-btn"
                            onClick={() => navigate(-1)} // Go back to previous page
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}