// Importing React and the CSS styles for the SkeletonLoader.
import React from 'react';
import '../styles/SkeletonLoader.css';

/**
 * SkeletonLoader Component:
 * A visual component that provides a "skeleton" loading animation, 
 * often used to indicate content is being loaded. 
 * 
 * The component displays a dummy content box (a skeleton) that mimics 
 * the shape of the actual content, but without the real data. This provides 
 * a smoother user experience as users can perceive something is loading.
 */
const SkeletonLoader: React.FC = () => {
    return (
        // The wrapping div for the skeleton loader.
        <div className="skeleton-wrapper">
            {/* Displaying a "Loading..." text with skeleton styles. 
                 The "skeleton" and "skeleton-line.shorter" classes 
                 provide the visual appearance and animation for the loader. */}
            <h3 className="skeleton skeleton-line.shorter"> Loading ...</h3>
        </div>
    );
}

export default SkeletonLoader;
