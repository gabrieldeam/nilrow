import React from 'react';
import PropTypes from 'prop-types';
import './ConfirmationButton.css';

const ConfirmationButton = ({
    text,
    backgroundColor,
    icon = null,
    type = 'button',
    onClick = () => {},
    disabled = false
}) => {
    return (
        <button
            className="confirmation-button roboto-black"
            style={{ backgroundColor: disabled ? '#212121' : backgroundColor }}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <img src={icon} alt="icon" className={`confirmation-button-icon ${text ? 'confirmation-with-text' : ''}`} />}
            <span>{text}</span>
        </button>
    );
};

ConfirmationButton.propTypes = {
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool
};

export default ConfirmationButton;
