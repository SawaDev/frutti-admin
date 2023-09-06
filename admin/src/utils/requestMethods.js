import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

const token = currentUser?.accessToken

export const publicRequest = axios.create({
  baseURL: BASE_URL,
})

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { token: `Bearer ${token}` }
})