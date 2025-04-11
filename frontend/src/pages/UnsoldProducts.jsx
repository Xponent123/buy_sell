import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./UnsoldProducts.css";

export default function SoldProducts() {
    const { sellerId } = useParams();
    const [soldProducts, setSoldProducts] = useState([]);

    useEffect(() => {
        const fetchSoldProducts = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/products/unsold/${sellerId}`);
                const data = await response.json();

                if (response.ok) {
                    setSoldProducts(data.products);
                } else {
                    toast.error(data.error || "Failed to fetch sold products.");
                }
            } catch (error) {
                console.error("Error fetching sold products:", error);
                toast.error("An error occurred while fetching sold products.");
            }
        };

        fetchSoldProducts();
    }, [sellerId]);

    return (
        <div className="main-container">
            <div className="sold-products-container">
                <h1>Unsold Products</h1>
                {soldProducts.length > 0 ? (
                    <ul className="sold-products-list">
                        {soldProducts.map((product) => (
                            <li key={product._id} className="sold-product-item">
                                <img 
                                    src={product.image_URL} 
                                    alt={product.name} 
                                    className="sold-product-image" 
                                />
                                <div className="product-name">{product.name}</div>
                                <div className="product-details-box">
                                    <div className="product-details-grid">
                                        <p>Price:</p>
                                        <p>${product.price}</p>
                                        <p>Category:</p>
                                        <p>{product.category}</p>
                                        <p>Description:</p>
                                        <p>{product.description}</p>
                                        <p>Listed on:</p>
                                        <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                                        <p>Last Updated:</p>
                                        <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-products-sold">No unsold products found.</p>
                )}
                <div className="dashboard-button-container">
                    <a href="/dashboard" className="go-to-dashboard">Go to Dashboard</a>
                </div>
            </div>
        </div>
    );
}