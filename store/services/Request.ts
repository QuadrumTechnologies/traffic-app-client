import { getItemFromCookie } from "@/utils/cookiesFunc";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 1000 * 60,
  responseType: "json",
});

instance.interceptors.request.use(
  function (config: any) {
    const userToken = getItemFromCookie("token");
    const adminToken = getItemFromCookie("adminToken");
    const token = userToken ? userToken : adminToken;

    config.headers = {
      ...config.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    };

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
