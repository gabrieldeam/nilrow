/* src/components/UI/Buttons/HeaderButtons/HeaderButtons.js */

import React from 'react';
import PropTypes from 'prop-types';
import './HeaderButton.css';

const Button = ({ text, icon }) => {
    return (
        <button className="custom-button roboto-regular">
            {icon && <img src={icon} alt="icon" className={`button-icon ${text ? 'with-text' : ''}`} />}
            <span>{text}</span>
        </button>
    );
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
    icon: PropTypes.string,
};

export default Button;
