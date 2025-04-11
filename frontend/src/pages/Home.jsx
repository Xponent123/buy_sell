import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/products"); // Fetch all products
                const data = await response.json();
                setProducts(data); // Assuming `data` is an array of products
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) 
    );

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome to Buy/Sell @ IIITH</h1>
                <p className="dashboard-welcome">Explore available products now!</p>
            </header>

            <div className="dashboard-search">
                <h3>Search Products</h3>
                <input
                    type="text"
                    placeholder="Search by product name..."
                    className="dashboard-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            <h3>Available Products:</h3>
            <div className="dashboard-grid">
                {filteredProducts
                    .filter((product) => !product.sold) 
                    .map((product) => (
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
                                    {/* </div> */}
                                    {/* <div className="product-card-description"> */}
                                    <p>Description:</p>
                                    <p>{product.description}</p>
                                </div>
                            </div>
                        </div>

                    ))}
            </div>
        </div>
    );
}
