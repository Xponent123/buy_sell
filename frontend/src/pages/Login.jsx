import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { UserContext } from "../../context/userContext";
import './Login.css';
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const [captchaToken, setCaptchaToken] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const userData = searchParams.get('userData');

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                toast.success("Login successful!");

                navigate("/dashboard");
            } catch (error) {
                console.error("Error processing login data:", error);
                toast.error("Login failed. Please try again.");
            }
        }
    }, [searchParams, setUser, navigate]);



    const handleCASLogin = () => {
        window.location.href = 'http://localhost:8000/cas/login';
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const loginUser = async (e) => {
        e.preventDefault();
        const { email, password } = data;

        if (!captchaToken) {
            toast.error("Please complete the CAPTCHA verification.");
            return;
        }

        try {
            const response = await axios.post(
                "/login",
                { email, password, captchaToken }, 
                { withCredentials: true }
            );

            if (response.data.error) {
                toast.error(response.data.error);
                return;
            }

            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            setData({ email: "", password: "" });
            toast.success("Login successful!");

            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.error || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-container">
                <div className="login-box">
                    <h2>Sign in</h2>
                    <form onSubmit={loginUser}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="name@iiit.ac.in"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
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

                        <div>
                            <ReCAPTCHA
                                sitekey="6Lfe08IqAAAAABOwUmu1nr6UAnPR-_-r4l5r6XUf"
                                onChange={handleCaptchaChange}
                                className="captcha"
                            />
                        </div>

                        <button className="button1" type="submit">
                            Sign In
                        </button>
                        <div className="register-link">
                            <p>Don't have an account? <a href="/register">Sign Up</a></p>
                        </div>

                     
                        <div className="divider">
                            <span className="divider-line"></span>
                            <span className="divider-text">OR</span>
                            <span className="divider-line"></span>
                        </div>

                        <div className="cas-login-container">
                            <button className="cas-login-button" onClick={handleCASLogin}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Login with College ID
                            </button>
                            <p className="info-text">Secure authentication using college credentials</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}