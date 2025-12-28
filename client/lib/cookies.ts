/**
 * Cookie utility functions for authentication
 */

export interface CookieOptions {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean; // Note: httpOnly can only be set by server
}

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  const {
    expires,
    path = "/",
    domain,
    secure = process.env.NODE_ENV === "production",
    sameSite = "lax",
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}; path=${path}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

export const removeCookie = (name: string, options: CookieOptions = {}) => {
  const { path = "/", domain } = options;

  // Set the cookie with an expired date to remove it
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
};

// Authentication-specific cookie functions
export const setAuthToken = (token: string) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  setCookie("authToken", token, {
    expires,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
};

export const getAuthToken = (): string | null => {
  return getCookie("authToken");
};

export const removeAuthToken = () => {
  removeCookie("authToken", { path: "/" });
};

export const setUserData = (user: any) => {
  // Store user data in a cookie (not httpOnly since client needs to read it)
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  setCookie("userData", JSON.stringify(user), {
    expires,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
};

export const getUserData = (): any | null => {
  const userData = getCookie("userData");
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
  removeCookie("userData", { path: "/" });
};
