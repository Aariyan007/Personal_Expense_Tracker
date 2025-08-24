import { useNavigate } from "react-router-dom";
import userContext, { UserDataContext } from "./context/UserDataContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Loader from './loader/loader.jsx';

const UserProtectedWrapper = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { userData, setuserData } = useContext(UserDataContext);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            if(response.status === 200){
                // Ensure currency property exists, fallback to USD if not provided
                const userDataWithCurrency = {
                    ...response.data.user,
                    currency: response.data.user.currency || 'USD'
                };
                setuserData(userDataWithCurrency); 
                setIsLoading(false);
            }
        })
        .catch((err) => {
            console.log(err);
            localStorage.removeItem("token");
            navigate('/login');
        });

    }, [token, navigate, setuserData]);

    if (isLoading) {
        return <Loader />; 
    }

    return <>{children}</>;
};

export default UserProtectedWrapper;
