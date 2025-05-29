import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { UserContext } from "../../context/userContext";
import Chatbot from "./Chatbot"; 
import toast from "react-hot-toast";
import axios from "axios";
import { PlusCircle, ShoppingCart, PackageCheck, PackageX, User, Truck, ClipboardList, LayoutGrid } from 'lucide-react'; 
import './Dashboard.css';

export default function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [showMyProducts, setShowMyProducts] = useState(false); // This might be removed if not used for anything else on dashboard
    
    const [displayText, setDisplayText] = useState('');
    const [animationPhase, setAnimationPhase] = useState('INIT'); 
    const [currentUserDisplayName, setCurrentUserDisplayName] = useState('Guest');

    const subtitleText = "This is a Marketplace Exclusively for IIITH Students.";
    // welcomeText will be derived inside the effect

    const navigate = useNavigate(); 
    const location = useLocation(); 
    // Removed categories array as it's moved to AvailableProducts.jsx

    const reloadPage = () => {
        window.location.reload();
    };

    // Removed useEffect for fetchProducts
    // Removed useEffect for updating searchQuery from URL (this logic is now in AvailableProducts.jsx)

    useEffect(() => {
        const newName = user?.name || user?.firstName || 'Guest';
        if (newName !== currentUserDisplayName || animationPhase === 'DONE' || (animationPhase === 'INIT' && !displayText)) {
            setCurrentUserDisplayName(newName);
            setDisplayText('');
            setAnimationPhase('INIT');
        }
    }, [user, currentUserDisplayName, animationPhase, displayText]);


    useEffect(() => {
        let timer;
        const currentWelcomeText = `Welcome, ${currentUserDisplayName}!`;

        switch (animationPhase) {
            case 'INIT':
                if (currentUserDisplayName) {
                    setAnimationPhase('TYPING_WELCOME');
                }
                break;
            case 'TYPING_WELCOME':
                if (displayText.length < currentWelcomeText.length) {
                    timer = setTimeout(() => {
                        setDisplayText(currentWelcomeText.substring(0, displayText.length + 1));
                    }, 100); 
                } else {
                    setAnimationPhase('PAUSE_AFTER_WELCOME');
                }
                break;
            case 'PAUSE_AFTER_WELCOME':
                timer = setTimeout(() => {
                    setAnimationPhase('ERASING_WELCOME');
                }, 1500); 
                break;
            case 'ERASING_WELCOME':
                if (displayText.length > 0) {
                    timer = setTimeout(() => {
                        setDisplayText(displayText.substring(0, displayText.length - 1));
                    }, 60); 
                } else {
                    setAnimationPhase('TYPING_SUBTITLE');
                }
                break;
            case 'TYPING_SUBTITLE':
                if (displayText.length < subtitleText.length) {
                    timer = setTimeout(() => {
                        setDisplayText(subtitleText.substring(0, displayText.length + 1));
                    }, 70); 
                } else {
                    setAnimationPhase('DONE');
                }
                break;
            case 'DONE':
                break;
            default:
                break;
        }
        return () => clearTimeout(timer);
    }, [displayText, animationPhase, currentUserDisplayName, subtitleText]); 

    // Removed handleCategoryToggle
    // Removed handleAddToCart (unless there's a "featured product" on dashboard that needs it)
    // Removed filteredProducts logic

    const handleLogout = async () => {
        try {
            await axios.post('/logout', {}, {
                withCredentials: true
            });
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization']; 
            setUser(null); 
            navigate('/login');
            toast.success('Logout successful'); 
        } catch (error) {
            console.error('Logout failed', error);
            alert('Logout failed. Please try again.'); 
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Your Campus Hub</h1>
                <h2 className="typewriter-text-container">
                  {displayText}
                  {animationPhase !== 'DONE' && <span className="typewriter-cursor">|</span>}
                </h2>
            </div>

            <div className="dashboard-actions">
                <div className="dashboard-card" onClick={() => navigate('/addproduct')}>
                    <PlusCircle size={32} color="#5b6eff" />
                    <h3>List an Item</h3>
                    <p>Ready to sell? Add your item's details and find a new owner within IIITH.</p>
                </div>
                <div className="dashboard-card" onClick={() => navigate(`/cart/${user?.id}`)}>
                    <ShoppingCart size={32} color="#5b6eff" />
                    <h3>Your Shopping Bag</h3>
                    <p>Check items you've selected, make changes, or proceed to checkout.</p>
                </div>
                <div className="dashboard-card" onClick={() => navigate('/products')}>
                    <LayoutGrid size={32} color="#5b6eff" /> 
                    <h3>Explore Marketplace</h3> 
                    <p>Discover a variety of items offered by students across the campus.</p> 
                </div>
                <div className="dashboard-card" onClick={() => navigate(`/pendingorders/${user?.id}`)}>
                    <ClipboardList size={32} color="#5b6eff" />
                    <h3>Sales to Fulfill</h3>
                    <p>View and manage orders for items you've sold that are awaiting delivery.</p>
                </div>
                 {/* "My Order History" tile REMOVED */}
                 {/* 
                 <div className="dashboard-card" onClick={() => navigate(`/orderhistory/${user?.id}`)}>
                    <History size={32} color="#5b6eff" />
                    <h3>My Order History</h3>
                    <p>Review all the purchases and sales you've made.</p>
                </div>
                 */}
            </div>

            <div className="chatbot-container-dashboard"> 
                <Chatbot />
            </div>
        </div>
    );
}
