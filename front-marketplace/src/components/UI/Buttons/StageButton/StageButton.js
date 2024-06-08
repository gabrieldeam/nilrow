import React from 'react';
import PropTypes from 'prop-types';
import './StageButton.css';

const StageButton = ({ text, backgroundColor, onClick, imageSrc }) => {
    return (
        <button 
            className="stage-button"
            style={{ backgroundColor }}
            onClick={onClick}
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

StageButton.defaultProps = {
    backgroundColor: '#7B33E5',
    onClick: () => {},
    imageSrc: null,
};

export default StageButton;
