    import { useEffect, useState } from "react";
    import { useParams } from "react-router-dom";
    import toast from "react-hot-toast";

    export default function SoldProducts() {
        const { sellerId } = useParams();
        const [soldProducts, setSoldProducts] = useState([]);

        useEffect(() => {
            const fetchSoldProducts = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/products/sold/${sellerId}`);
                    const data = await response.json();

                    if (response.ok) {
                        setSoldProducts(data.products || []);
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
                    <h1>Sold Products</h1>
                    {soldProducts.length > 0 ? (
                        <ul className="sold-products-list">
                            {soldProducts.map((product) => (
                                <li key={product._id} className="sold-product-item">
                                    <h3>{product.name}</h3>
                                    <div className="product-details-box">
                                        <p>Price: ${product.price}</p>
                                        <p>Category: {product.category}</p>
                                        <p>Description: {product.description}</p>
                                        <p>Sold on: {new Date(product.updatedAt).toLocaleString()}</p>
                                    </div>
                                    <img src={product.image_URL} alt="product" className="sold-product-image" />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-products-sold">No products sold yet.</p>
                    )}
                    <div className="dashboard-button-container"> 
                        <a href="/dashboard" className="go-to-dashboard">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        );
    }