import React from 'react';
import PropTypes from 'prop-types';
import './CustomButton.css';

const CustomButton = ({ title, backgroundColor="#007BFF", onClick }) => {
    return (
        <button 
            className="custom-button-pro" 
            style={{ backgroundColor }}
            onClick={onClick}
        >
            {title}
        </button>
    );
};

CustomButton.propTypes = {
    title: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string
};

export default CustomButton;
