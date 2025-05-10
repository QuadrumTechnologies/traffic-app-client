import { getItemFromCookie } from "@/utils/cookiesFunc";
import axios, { InternalAxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 1000 * 60,
  responseType: "json",
});

// Helper function to check if code is running in the browser
const isBrowser = typeof window !== "undefined";

instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    const userToken = getItemFromCookie("token");
    const adminToken = getItemFromCookie("adminToken");

    let token: string | null;

    // Check pathname if in browser
    if (isBrowser) {
      const pathname = window.location.pathname;
      console.log("Pathname on Request", pathname);
      if (pathname.includes("admin")) {
        token = adminToken;
      } else {
        token = userToken;
      }
    } else {
      token = userToken;
    }

    // Set Authorization header
    config.headers = {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    } as any;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const Request = async (options: any) => {
  try {
    const response = await instance(options);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default Request;
