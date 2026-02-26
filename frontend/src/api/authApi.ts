import axiosInstance from "./axios";

// ADD 'return' to all these functions!
export const loginUser = (data: {email:string, password:string}) => {
    return axiosInstance.post("/auth/login", data);
}

export const signupUser = (data: {name?:string, email:string, password:string}) => {
    return axiosInstance.post("/auth/signup", data);
}

export const checkAuth = () => {
    return axiosInstance.get("/auth/me");

}

export const logoutUser = () => {
    return axiosInstance.post("/auth/logout");
}