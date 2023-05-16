import axios from "axios";

const BASE_URL = "http://localhost:8801/api/";
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

const token = currentUser?.accessToken

export const publicRequest = axios.create({
  baseURL: BASE_URL,
})

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { token: `Bearer ${token}` }
})