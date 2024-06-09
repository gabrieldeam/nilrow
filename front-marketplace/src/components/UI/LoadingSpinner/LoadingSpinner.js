import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner spinner-1"></div>
            <div className="spinner spinner-2"></div>
        </div>
    );
};

export default LoadingSpinner;
