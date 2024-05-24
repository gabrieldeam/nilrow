/* src/components/UI/Buttons/ConfirmationButton/ConfirmationButton.js */

import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmationButton.css';

const Button = ({ text, backgroundColor, icon, type }) => {
    return (
        <button className="confirmation-button" style={{ backgroundColor }} type={type}>
            {icon && <img src={icon} alt="icon" className={`confirmation-button-icon ${text ? 'confirmation-with-text' : ''}`} />}
            <span>{text}</span>
        </button>
    );
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string
};

export default Button;
