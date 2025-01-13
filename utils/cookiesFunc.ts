import Cookies from "js-cookie";

// Function to store a token in a cookie
export const setItemToCookie = (
  key: string,
  value: string,
  expiresIn: number
): void => {
  Cookies.set(key, value, { expires: expiresIn });
};

// Function to retrieve a token from the cookie
export const getItemFromCookie = (key: string): string | null => {
  return Cookies.get(key) || null;
};

// Function to remove the token cookie
export const removeItemFromCookie = (key: string): void => {
  Cookies.remove(key);
};
