import axiosInstance from "./axios";

// ADD 'return' to all these functions!
export const loginUser = (data: {email:string, password:string}) => {
    return axiosInstance.post("/auth/login", data);
}

export const signupUser = (data: {name?:string, email:string, password:string}) => {
    return axiosInstance.post("/auth/signup", data);
}

export const checkAuth = () => {
<<<<<<< HEAD
    return axiosInstance.get("/auth/me")
=======
    return axiosInstance.get("/auth/me");
>>>>>>> 933a9fd7e09b7e8bcce0101c1e95081106b6d9cf
}

export const logoutUser = () => {
    return axiosInstance.post("/auth/logout");
}