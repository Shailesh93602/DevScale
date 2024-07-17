import axios from "axios";
import Cookies from "js-cookie";

const customAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "https://mrengineersapi.com",
});

customAxios.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default customAxios;
