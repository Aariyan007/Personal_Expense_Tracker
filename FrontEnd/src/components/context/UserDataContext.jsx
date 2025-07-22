import React,{createContext,useState} from "react";

export const UserDataContext = createContext();

const userContext = ({children}) =>{
    
    const [userData,setuserData] = useState({
        email: "",
        username:"",
    });

    return (
        <div>
            <UserDataContext.Provider value = {{userData,setuserData}}>
                {children}  
            </UserDataContext.Provider>
        </div>
    )

}
export default userContext;