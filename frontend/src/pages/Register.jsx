import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        contactNumber: '',
        password: '',
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const casData = params.get('data');
        
        if (casData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(casData));
                setData(prevData => ({
                    ...prevData,
                    ...parsedData,
                }));
            } catch (error) {
                console.error('Error parsing CAS data:', error);
                toast.error('Error loading pre-filled data');
            }
        }
    }, []);

    const registerUser = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, age, contactNumber, password } = data;
        try {
            const { data: response } = await axios.post('/register', {
                firstName,
                lastName,
                email,
                age,
                contactNumber,
                password,
            });
            if (response.error) {
                toast.error(response.error);
            } else {
                setData({});
                toast.success('User registered successfully');
                navigate('/login');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-container">
                <div className="register-box">
                    <h2>Complete Your Registration</h2>
                    <form onSubmit={registerUser}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            placeholder="First Name"
                            value={data.firstName}
                            onChange={(e) => setData({ ...data, firstName: e.target.value })}
                            required
                            readOnly={!!location.search} 
                        />

                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            placeholder="Last Name"
                            value={data.lastName}
                            onChange={(e) => setData({ ...data, lastName: e.target.value })}
                            required
                            readOnly={!!location.search} 
                        />

                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            required
                            readOnly={!!location.search} 
                        />

                        <label htmlFor="age">Age</label>
                        <input
                            type="number"
                            id="age"
                            placeholder="Age"
                            value={data.age}
                            onChange={(e) => setData({ ...data, age: e.target.value })}
                            required
                        />

                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            placeholder="Contact Number"
                            value={data.contactNumber}
                            onChange={(e) => setData({ ...data, contactNumber: e.target.value })}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            required
                        />

                        <button type="submit">Complete Registration</button>
                        <p className="signup-link">
                            Already having Account? <a href="/login">Sign in</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}