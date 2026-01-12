export const USE_FIREBASE = true;

// Base URL
export const API_URL = "http://localhost:8080/api";

// Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
    },
    CAR: {
        LIST: "/cars",
        DETAIL: (id: number) => `/cars/${id}`,
    },
};
