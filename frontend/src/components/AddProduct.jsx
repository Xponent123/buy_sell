import React, { useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import './AddProduct.css';


export default function AddProduct() {
    const { user } = useContext(UserContext);
    const [product, setProduct] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        image_URL: "",
    });
    const [message, setMessage] = useState("");

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

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("You must be logged in to add a product.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/products/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...product,
                    sellerId: user.id, 
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Product added successfully!");
                setProduct({ name: "", price: "", description: "", category: "", image_URL: "" });
            } else {
                setMessage(data.error || "Failed to add product.");
            }
        } catch (err) {
            console.error(err);
            setMessage("An error occurred while adding the product.");
        }
    };

    return (
        <div className="main-container5" display="flex" justify-content="center" align-items="center" flex-direction="column" >
            <div className="add-product-container5">
                <h2 className="add-product-title5">Add Product</h2>

                <form onSubmit={handleSubmit} className="add-product-form">
                 

                    <div className="form-group5">
                        <label htmlFor="name" className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={product.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="form-group5">
                        <label htmlFor="price" className="form-label">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            value={product.price}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter product price"
                            required
                        />
                    </div>

                    <div className="form-group5">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={product.description}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter product description"
                            required
                        ></textarea>
                    </div>
                    <div className="form-group5">

                        <label htmlFor="category" className="form-label">
                            Category
                        </label>
                        <select
                            name="category"
                            id="category"
                            value={product.category}
                            onChange={handleChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select a Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group5">
                        <label htmlFor="image_URL" className="form-label">
                            Image URL
                        </label>
                        <input
                            type="text"
                            name="image_URL"
                            id="image_URL"
                            value={product.image_URL}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter product image URL"
                            required
                        />
                    </div>

                    {product.image_URL && (
                        <div className="image-preview5">
                            <img src={product.image_URL} alt="Product"
                                placeholder="Enter product image URL" required
                            />

                        </div>
                    )}
                    <div className="submit-button-container5">
                        <button type="submit" className="submit-button5">
                            Add Product
                        </button>
                    </div>
                    {message && <p className={`message ${message.startsWith("Product") ? "success" : "error"}`}>{message}</p>}

                    <div className="dashboard-link-container5">
                        <a href="/dashboard" className="dashboard-link5">
                            Go to Dashboard
                        </a>
                    </div>




                    
                </form>
            </div >
        </div >
    );
}