import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast";
import './Profile.css'

export default function Profile() {
    const { userId } = useParams();
    const { user, setUser } = useContext(UserContext);
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

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                console.log("Fetching data for userId:", userId);
                const [userResponse, reviewsResponse] = await Promise.all([
                    fetch(`http://localhost:8000/api/users/${userId}`),
                    fetch(`http://localhost:8000/api/users/seller-reviews/${userId}`)
                ]);

                const userData = await userResponse.json();
                const reviewsData = await reviewsResponse.json();

                console.log("Reviews data:", reviewsData);

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

        if (newPassword && newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formDetails,
                    oldPassword: oldPassword || undefined,
                    newPassword: newPassword || undefined,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserDetails(data.user);

                const updatedUser = {
                    ...user,
                    ...data.user
                };
                setUser(updatedUser);

                localStorage.setItem('user', JSON.stringify(updatedUser));

                toast.success("Profile updated successfully!");
                setIsEditing(false);

                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(data.error || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating your profile.");
        }
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
                        <div className="profile-detail-box">
                            <h3>Name</h3>
                            <p>{userDetails.firstName} {userDetails.lastName}</p>
                        </div>
                        <div className="profile-detail-box">
                            <h3>Email</h3>
                            <p>{userDetails.email}</p>
                        </div>
                        <div className="profile-detail-box">
                            <h3>Contact Number</h3>
                            <p>{userDetails.contactNumber}</p>
                        </div>
                        <div className="profile-detail-box">
                            <h3>Age</h3>
                            <p>{userDetails.age}</p>
                        </div>
                        <div className="edit-button-container">
                            <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        </div >


                        {sellerReviews && sellerReviews.length > 0 ? (
                            <div className="seller-reviews-section">
                                <h3>Seller Reviews ({sellerReviews.length})</h3>
                                {sellerReviews.map((review, index) => (
                                    <div key={index} className="seller-review-item">
                                        <div className="review-header">
                                            <div className="reviewer-name">
                                                {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                                            </div>
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, starIndex) => (
                                                    <span
                                                        key={starIndex}
                                                        className={`rating-star ${starIndex < review.rating ? 'filled' : 'empty'}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-text">"{review.review}"</p>
                                        <p className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="seller-reviews-section">
                                <h3>Seller Reviews (0)</h3>
                                <div className="no-reviews">
                                    No reviews yet. Be the first to leave a review!
                                </div>
                            </div>
                        )}
                      
                    </div>
                ) : (
                    <form className="profile-form1" onSubmit={handleSubmit}>
                        <div className="profile-form">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formDetails.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formDetails.lastName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formDetails.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input type="number" name="age" value={formDetails.age} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input type="text" name="contactNumber" value={formDetails.contactNumber} onChange={handleChange} required />
                            </div>

                            <h3>Change Password</h3>
                            <div className="form-group">
                                <label>Old Password</label>
                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-buttons">
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                )}
                <div className="dashboard-button-container">
                    <a href="/dashboard" className="go-to-dashboard">Go to Dashboard</a>
                </div>
            </div>
        </div>
    );
}