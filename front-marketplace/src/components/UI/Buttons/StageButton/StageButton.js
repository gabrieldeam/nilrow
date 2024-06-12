import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './StageButton.css';

const StageButton = ({ text, backgroundColor = '#7B33E5', onClick = () => {}, imageSrc = null }) => {
    const handleClick = useCallback((e) => {
        if (onClick) {
            onClick(e);
        }
    }, [onClick]);

    return (
        <button 
            className="stage-button"
            style={{ backgroundColor }}
            onClick={handleClick}
        >
            {imageSrc && <img src={imageSrc} alt="" className="stage-button-icon" />}
            {text}
        </button>
    );
};

StageButton.propTypes = {
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    onClick: PropTypes.func,
    imageSrc: PropTypes.string,
};

export default memo(StageButton);
