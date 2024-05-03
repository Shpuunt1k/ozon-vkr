import axios from 'axios';
import {AuthResponse} from "../models/response/AuthResponse";


export const API_URL = 'http://localhost:5000/api'
export const OZON_URL = 'https://api-seller.ozon.ru'


export const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})
export const $ozon = axios.create({
    withCredentials: true,
    baseURL: OZON_URL
})

// $ozon.interceptors.request.use((config) =>{
//     config.headers['Client-Id'] = 
// })
$api.interceptors.request.use((config) =>{
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    return config
})
$api.interceptors.response.use((config) => {
    return config;
},async (error) => {
    const originalRequest = error.config;
    if (error.response.status == 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {withCredentials: true})
            localStorage.setItem('token', response.data.accessToken);
            return $api.request(originalRequest);
        } catch (e) {
            console.log('НЕ АВТОРИЗОВАН')
        }
    }
    throw error;
})
