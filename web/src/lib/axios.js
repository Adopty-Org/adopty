import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('Missing VITE_API_URL');
}

const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    withCredentials : true,
})

// 🔐 variable interne pour stocker getToken
let getTokenFn = null;

// 👉 fonction pour injecter getToken depuis React
export const setAuthTokenGetter = (fn) => {
  getTokenFn = fn;
};

// 🔐 interceptor automatique
axiosInstance.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      try {
        const token = await getTokenFn();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Erreur récupération token Clerk:", err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default axiosInstance;