import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('Missing VITE_API_URL');
}

const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    withCredentials : true,
})


export default axiosInstance;