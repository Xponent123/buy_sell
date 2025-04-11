import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import './Profile.css';

export default function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [sellerReviews, setSellerReviews] = useState([]);
    const [formDetails, setFormDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        age: "",
        contactNumber: "",
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const [userResponse, reviewsResponse] = await Promise.all([
                    fetch(`http://localhost:8000/api/users/${userId}`),
                    fetch(`http://localhost:8000/api/users/seller-reviews/${userId}`)
                ]);

                const userData = await userResponse.json();
                const reviewsData = await reviewsResponse.json();

                if (userResponse.ok && reviewsResponse.ok) {
                    setUserDetails(userData.user);
                    setFormDetails(userData.user);
                    setSellerReviews(reviewsData.reviews);
                } else {
                    toast.error(userData.error || reviewsData.error || "Failed to fetch details.");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
                toast.error("An error occurred while fetching details.");
            }
        };

        fetchUserDetails();
    }, [userId]);


    const handleChange = (e) => {
        setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDetails),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Profile updated successfully!");
                setUserDetails(data.user);
                setIsEditing(false);
            } else {
                toast.error(data.error || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating your profile.");
        }
    };

    const renderSellerReviews = () => {
        if (sellerReviews.length === 0) {
            return <p>No seller reviews yet.</p>;
        }

        return (
            <div className="seller-reviews-section">
                <h3>Seller Reviews</h3>
                {sellerReviews.map((review, index) => (
                    <div key={index} className="seller-review-item">
                        <div className="review-header">
                            <p className="reviewer-name">
                                Reviewed by: {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                            </p>
                            <p className="review-rating">Rating: {review.rating}/5</p>
                        </div>
                        <p className="review-text">{review.review}</p>
                        {review.productId && (
                            <div className="review-product">
                                <img 
                                    src={review.productId.image_URL} 
                                    alt={review.productId.name} 
                                    className="review-product-image"
                                />
                                <p>{review.productId.name}</p>
                            </div>
                        )}
                        <p className="review-date">
                            Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    if (!userDetails) {
        return <p>Loading...</p>;
    }


    return (
        <div className="main-container">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>User Profile</h1>
                </div>

                {!isEditing ? (
                    <div className="profile-details">
                        <h2>{userDetails.firstName} {userDetails.lastName}</h2>
                        <p><strong>Email:</strong> {userDetails.email}</p>
                        <p><strong>Age:</strong> {userDetails.age}</p>
                        <p><strong>Contact Number:</strong> {userDetails.contactNumber}</p>
                        <button className="edit-profile-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                    </div>
                ) : (
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formDetails.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formDetails.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formDetails.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formDetails.age}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={formDetails.contactNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-buttons">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                )}
                 {renderSellerReviews()}

                <div className="go-to-dashboard">
                    <a href="/dashboard">Back to Dashboard</a>
                </div>
            </div>
        </div>
    );
}