import { useEffect, useState } from "react";

// Constants
const API_CHECK_TOKEN_VALIDITY = 'http://localhost:3000/auth/checkTokenValidity';
const API_REFRESH_TOKEN = 'http://localhost:3000/auth/refreshToken';
const FETCH_TIMEOUT = 5000;  // Timeout for the fetch call set to 5 seconds

const isTokenExpired = async (): Promise<boolean> => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(API_CHECK_TOKEN_VALIDITY, {
            method: 'GET',
            credentials: 'include',
            signal: controller.signal
        });

        if (response.ok) {
            return false;
        } else if (response.status === 401) {
            return true;
        } else {
            throw new Error(`Error status ${response.status}`);
        }
    } catch (error) {
        if (error === "AbortError") {
            console.error("Token check request was aborted due to timeout.");
        } else {
            console.error("Token check error:", error);
        }
        throw error;
    }
}

const refreshToken = async (): Promise<string | null> => {
    try {
        const response = await fetch(API_REFRESH_TOKEN, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.token;
        } else {
            console.error(`Error refreshing token, status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error("Error during token refresh:", error);
        return null;
    }
}

const useTokenExpired = (token: string, setToken: React.Dispatch<React.SetStateAction<string>>) => {
    const [tokenExpired, setTokenExpired] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const expired = await isTokenExpired();
                if (expired) {
                    const newToken = await refreshToken();
                    if (newToken) {
                        setToken(newToken);
                        setTokenExpired(false);
                    } else {
                        setTokenExpired(true);
                    }
                } else {
                    setTokenExpired(false);
                }
            } catch {
                setTokenExpired(true);
            }
        }

        checkToken();
    }, [token, setToken]);

    return tokenExpired;
}

export default useTokenExpired;
