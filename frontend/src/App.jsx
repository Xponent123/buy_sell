import React, { useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import Cart from "./components/Cart";
import OrderHistory from "./pages/OrderHistory";
import SoldProducts from "./pages/SoldProducts";
import UnsoldProducts from "./pages/UnsoldProducts";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import ChatBot from "./pages/Chatbot";
import YetToBeDelivered from "./pages/YettobeDelivered";
import PendingOrders from "./pages/PendingOrders";
import { Toaster } from "react-hot-toast";
import { UserContextProvider, UserContext } from "../context/userContext";
import axios from "axios";
import "./axiosConfig";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

const ProtectedRoute = ({ children }) => {
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    } else if (!storedUser && !user) {
      navigate("/login"); 
    }
  }, [user, setUser, navigate]);

  return user ? children : null;
};

const App = () => {
  const navigate = useNavigate();


useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser && window.location.pathname === '/') {
    navigate("/dashboard");
  }
}, [navigate]);

  return (
    <UserContextProvider>
      <Navbar />
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <Routes>
    
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addproduct"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editproduct/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart/:userId"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orderhistory/:userId"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soldproducts/:sellerId"
          element={
            <ProtectedRoute>
              <SoldProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unsoldproducts/:sellerId"
          element={
            <ProtectedRoute>
              <UnsoldProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:productId"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/yettobedelivered/:buyerId"
          element={
            <ProtectedRoute>
              <YetToBeDelivered />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendingorders/:sellerId"
          element={
            <ProtectedRoute>
              <PendingOrders />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </UserContextProvider>
  );
};

export default App;
