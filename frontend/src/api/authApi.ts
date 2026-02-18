import axios from "axios";
import axiosInstance from "./axios";
import { data } from "react-router-dom";


export const loginUser=(data: {email:string, password:string}) => {
    axiosInstance.post("/auth/login",data)
}

export const signupUser = (data: {name?:string ,email:string,password:string}) => {
    axiosInstance.post("/auth/signup",data)
}

export const checkAuth:any = () => {
    axiosInstance.get("/auth/me")
}

export const logoutUser = ()=>{
    axiosInstance.post("/auth/logout")
}