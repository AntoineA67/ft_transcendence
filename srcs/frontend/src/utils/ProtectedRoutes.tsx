// import React, { useState, useEffect } from "react";
// // import { Navigate } from "react-router-dom";
import useTokenExpired from "../hooks/useTokenExpired";
// import SkeletonLoader from "./SkeletonLoader";

// /**
//  * This interface defines the expected props for the ProtectedRoute component.
//  * It should receive children components that this route will render conditionally.
//  */
// interface ProtectedRouteProps {
//     children: React.ReactNode;
// }

// // Constant defining the minimum amount of time the loader should be visible (2 seconds).
// const MIN_LOADING_TIME = 2000;

// /**
//  * ProtectedRoute is a higher-order component that wraps around parts of the app
//  * requiring JWT token validation for access.
//  *
//  * If the token is not determined yet, it shows a SkeletonLoader for at least 2 seconds.
//  * If the token is invalid/expired, it redirects to the sign-in page.
//  * If the token is valid, it renders the children components.
//  *
//  * @param children React components or elements to render conditionally based on token validity.
//  * @returns A loader, a redirect to the sign-in page, or the children components based on the token's status.
//  */
// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//     // Using a custom hook to check whether the token has expired or not.
//     const tokenExpired = useTokenExpired();
//     // State to manage the visibility of the skeleton loader.
//     const [showLoader, setShowLoader] = useState(true);

//     useEffect(() => {
//         // This effect ensures that the loader stays on the screen for a minimum time,
//         // even if the token status is determined quickly.
//         const loadingTimeout = setTimeout(() => {
//             setShowLoader(false);
//             // console.log("passing by first useEffect\n");
//         }, MIN_LOADING_TIME);

//         // Cleanup function: Clears the timer if the component is unmounted to prevent potential issues.
//         return () => clearTimeout(loadingTimeout);
//     }, []);

//     // If the loader state is active, render the SkeletonLoader.
//     if (showLoader || tokenExpired == null) {
//         return <SkeletonLoader />;
//     }

//     // If the token has expired, redirect the user to the sign-in page.
//     if (tokenExpired) {
//         return <Navigate to='/signin' />;
//     }

//     // If the token is valid, render the children components.
//     return <>{children}</>;
// }

// export default ProtectedRoute;


// Assuming the Protected component is in ./utils/AuthProvider
// import useTokenExpired from './path_to_useTokenExpired_file'; // Adjust this import path as necessary
import { Navigate } from 'react-router-dom';

interface ProtectedProps {
    children?: React.ReactNode;  // This line ensures children is recognized
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
    const tokenExpired = useTokenExpired();

    if (tokenExpired === null) {
        return <div>Loading...</div>;  // You can replace this with a loader or a skeleton component
    }

    if (tokenExpired) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}

export default Protected;