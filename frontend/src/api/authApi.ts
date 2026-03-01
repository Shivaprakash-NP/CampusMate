import axiosInstance from "./axios";

// 1. Updated the type to include your new academic fields
export type SignupData = {
    name: string;
    email: string;
    password: string;
    year: string;
    branch: string;
    college: string;
}

export const loginUser = (data: {email:string, password:string}) => {
    return axiosInstance.post("/auth/login", data);
}

// 2. Applied the updated type here
export const signupUser = (data: SignupData) => {
    return axiosInstance.post("/auth/signup", data);
}

export const checkAuth = () => {
    return axiosInstance.get("/auth/me");
}

export const logoutUser = () => {
    return axiosInstance.post("/auth/logout");
}