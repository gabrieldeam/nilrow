import React, { useCallback, memo } from 'react';
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
    const handleClick = useCallback((event) => {
        onClick(event);
    }, [onClick]);

    return (
        <button
            className="confirmation-button roboto-black"
            style={{ backgroundColor: disabled ? '#212121' : backgroundColor }}
            type={type}
            onClick={handleClick}
            disabled={disabled}
        >
            {icon && <img src={icon} alt="icon" className={`confirmation-button-icon ${text ? 'confirmation-with-text' : ''}`} loading="lazy" />}
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

export default memo(ConfirmationButton);
