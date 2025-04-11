import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduct() {
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const [product, setProduct] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        image_URL: ""
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/products/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setProduct(data);
                } else {
                    setMessage("Failed to load product details.");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setMessage("An error occurred while fetching product details.");
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(product),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Product updated successfully!");
                setTimeout(() => navigate("/dashboard"), 2000); 
            } else {
                setMessage(data.error || "Failed to update product.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setMessage("An error occurred while updating the product.");
        }
    };

    return (
        <div>
            <a href="/" onClick={() => navigate("/dashboard")}>Go to Dashboard</a>
            <h1>Edit Product</h1>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Price</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Category</label>
                    <input
                        type="text"
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Image URL</label>
                    <input
                        type="text"
                        name="image_URL"
                        value={product.image_URL}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" >Save Changes</button>
                <button type="button" >
                    Cancel
                </button>
            </form>
        </div>
    );
}
