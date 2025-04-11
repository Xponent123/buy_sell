import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    
    const clearUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem("user");
        axios.defaults.headers.common["Authorization"] = null; 
    }, []);

    
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true); 
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
                } else {
                    
                    const { data } = await axios.get("/profile", { withCredentials: true });
                    if (data && data.id) {
                        setUser(data);
                        localStorage.setItem("user", JSON.stringify(data));
                        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                    }
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                clearUser(); 
            } finally {
                setLoading(false); 
            }
        };

        fetchUser();
    }, [clearUser]);

    return (
        <UserContext.Provider value={{ user, setUser, clearUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}
