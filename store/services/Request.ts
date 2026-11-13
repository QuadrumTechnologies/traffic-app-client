import { getItemFromCookie } from "@/utils/cookiesFunc";
import { endSession, isEndedSession } from "@/utils/session";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 1000 * 60,
  responseType: "json",
});

const isBrowser = typeof window !== "undefined";

instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    const userToken = getItemFromCookie("token");
    const adminToken = getItemFromCookie("adminToken");

    let token: string | null;

    if (isBrowser) {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/admin")) {
        token = adminToken;
      } else {
        token = userToken;
      }
    } else {
      token = userToken;
    }

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

// When the API no longer accepts the stored sign-in, send the person to the
// sign-in page instead of letting every panel show its own error. The pending
// promise keeps callers from reporting the failure while the page is replaced.
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const headers: any = error.config?.headers;
    const sentToken = Boolean(
      headers &&
        (typeof headers.get === "function"
          ? headers.get("Authorization")
          : headers.Authorization)
    );
    if (
      isBrowser &&
      sentToken &&
      isEndedSession(error.response?.status, error.response?.data?.message)
    ) {
      endSession();
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

const Request = async (options: any) => {
  try {
    const response = await instance(options);
    return response;
  } catch (err: unknown) {
    const error = err as AxiosError;
    return Promise.reject(error);
  }
};

export default Request;
