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
    if (Username.length < 3 || Username.length > 16) {
        return 'Username should be between 4 and 16 characters long.';
    }
    if (!/^[A-Za-z0-9-]/.test(Username)) {
        return 'Username should contain only alphanumeric characters and dashes.';
    }
    return null;
};