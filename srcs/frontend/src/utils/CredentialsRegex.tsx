// import { useOutletContext, Link } from "react-router-dom";
import { useState } from 'react';

/**
 * @brief Validates the given password against certain criteria
 * 
 * @param password User's password
 * 
 * @returns null if the password is valid, error message otherwise
 */
 export const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
        return 'Password should be at least 8 characters long.';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password should contain at least one lowercase letter.';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password should contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password should contain at least one digit.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password)) {
        return 'Password should contain at least one special character (e.g., @, #, $, etc.).';
    }
    return null;
};


/**
 * @brief Validates the given password against certain criteria
 * 
 * @param Username User's password
 * 
 * @returns null if the password is valid, error message otherwise
 */

 export const validateUsername = (Username: string): string | null => {
    if (Username.length < 4) {
        return 'Username should be at least 4 characters long.';
    }
    if (!/[a-z A-Z]/.test(Username)) {
        return 'Username should contain at least one letter.';
    }
    // if (!/[A-Z]/.test(Username)) {
    //     return 'Username should contain at least one uppercase letter.';
    // }
	if (/[\ ]/.test(Username)){
		return 'Username cannot contain a space character.';
	}
    // if (!/[0-9]/.test(Username)) {
    //     return 'Username should contain at least one digit.';
    // }
    // if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(Username)) {
    //     return 'Username should contain at least one special character (e.g., @, #, $, etc.).';
    // }
    return null;
};