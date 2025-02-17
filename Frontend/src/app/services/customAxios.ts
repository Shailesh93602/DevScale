import axios from 'axios';
import Cookies from 'js-cookie';

const customAxios = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://mrengineersapi.vercel.app',
});

customAxios.interceptors.request.use(
  async (config) => {
    const token = await Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default customAxios;
