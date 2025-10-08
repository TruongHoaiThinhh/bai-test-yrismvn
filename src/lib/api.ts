import { User } from "@/interface/user";

export const createAuthenticatedHeaders = (user: User) => ({
  "Content-Type": "application/json",
  "x-user-email": user.email,
});

export const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const authenticatedApiCall = async (url: string, user: User, options: RequestInit = {}) => {
  const headers = {
    ...createAuthenticatedHeaders(user),
    ...options.headers,
  };
  
  return apiCall(url, {
    ...options,
    headers,
  });
};
