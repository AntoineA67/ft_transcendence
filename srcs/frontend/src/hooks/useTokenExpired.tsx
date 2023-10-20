import { useEffect, useState } from "react";

// Constants
const API_CHECK_TOKEN_VALIDITY = 'http://localhost:3000/auth/checkTokenValidity';
const FETCH_TIMEOUT = 5000;  // Timeout for the fetch call set to 5 seconds

/**
 * Asynchronously checks whether the JWT token has expired or not.
 *
 * @returns Promise<boolean> - Returns a promise which resolves to a boolean.
 *                            True if the token has expired, false otherwise.
 *                            In case of any error, the function throws it.
 */
const isTokenExpired = async (): Promise<boolean> => {
    // Setup an abort controller to cancel the fetch request in case it takes too long.
    const controller = new AbortController();
    setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(API_CHECK_TOKEN_VALIDITY, {
            method: 'GET',
            credentials: 'include',
            signal: controller.signal  // Signal to possibly abort the fetch
        });

        // If the response is OK, then the token is valid (not expired).
        if (response.ok) {
            return false;
        } else {
            // If not OK, then there's an issue with the token. Throw an error.
            throw new Error(`Something is wrong with your token ${response.status}`);
        }

    } catch (error: any) {
        if (error?.message) {
            console.error("Token check error:", error.message);
        } else {
            console.error("Token check error:", error);
        }
        throw error;
    }
}

/**
 * Custom React hook to determine if the JWT token has expired.
 *
 * @returns boolean | null - Returns:
 *                           * true if the token has expired
 *                           * false if the token is valid
 *                           * null if the status hasn't been determined yet
 */
const useTokenExpired = () => {
    const [tokenExpired, setTokenExpired] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            try {
                // Check if the token has expired.
                const expired = await isTokenExpired();
                // Update the state with the result.
                setTokenExpired(expired);
            } catch (error) {
                // If there's any error (e.g., network issues, invalid token, etc.), 
                // we assume the token is expired for the purpose of this hook.
                setTokenExpired(true);
            }
        }
        // Initiate the token check.
        checkToken();
    }, []);

    // Return the token's expired status.
    return tokenExpired;
}

export default useTokenExpired;
