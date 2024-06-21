import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './SubButton.css';

const SubButton = ({ text, backgroundColor = '#7B33E5', onClick = () => {}, imageSrc = null }) => {
    const handleClick = useCallback((e) => {
        if (onClick) {
            onClick(e);
        }
    }, [onClick]);

    return (
        <button 
            className="sub-button-bu"
            style={{ backgroundColor }}
            onClick={handleClick}
        >
            {imageSrc && <img src={imageSrc} alt="icon" className="sub-button-icon-bu" />}
            {text}
        </button>
    );
};

SubButton.propTypes = {
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    onClick: PropTypes.func,
    imageSrc: PropTypes.string,
};

export default memo(SubButton);
