import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import './ProductDetails.css'

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



                <img src={product.image_URL} alt="product" className="product-details-image" height="50%" width="50%" />

                <h1 className="product-details-title">{product.name}</h1>

                <div className="product-details-info">
                    <div className="product-details-section">
                        <span className="product-details-label">Price</span>
                        <p className="product-details-value">${product.price}</p>
                    </div>

                    <div className="product-details-section">
                        <span className="product-details-label">Category</span>
                        <p className="product-details-value">{product.category}</p>
                    </div>

                    <div className="product-details-description">
                        <span className="product-details-label">Description</span>
                        <p className="product-details-value">{product.description}</p>
                    </div>

                    <div className="product-details-seller-info">
                        <div>
                            <span className="product-details-label">Seller Name</span>
                            <p className="product-details-value">
                                {product.sellerId?.firstName} {product.sellerId?.lastName || "Unknown Seller"}
                            </p>
                        </div>
                        <div>
                            <span className="product-details-label">Seller Email</span>
                            <p className="product-details-value">{product.sellerId?.email}</p>
                        </div>
                        <div>
                            <span className="product-details-label">Contact Number</span>
                            <p className="product-details-value">{product.sellerId?.contactNumber}</p>
                        </div>
                    </div>
                </div>
                <div className="product-details-back-btn-container">
                <button
                    className="product-details-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
                </div>
            </div>
        </div>
    );
}