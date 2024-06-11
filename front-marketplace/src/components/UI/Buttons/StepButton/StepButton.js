import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './StepButton.css';
import verifiedIcon from '../../../../assets/verificacao.svg';
import arrowIcon from '../../../../assets/setadireito.svg';

const StepButton = ({
    icon,
    title,
    paragraph,
    isVerified = false,
    onClick
}) => {
    const handleClick = useCallback((e) => {
        if (onClick) {
            onClick(e);
        }
    }, [onClick]);

    return (
        <button className="step-button" onClick={handleClick}>
            <div className="step-button-left">
                <div className="step-button-icon-circle">
                    <img src={icon} alt="Step Icon" className="step-button-icon" />
                </div>
                <div className="step-button-text roboto-regular">
                    <h3>{title}</h3>
                    <p>{paragraph}</p>
                </div>
            </div>
            <div className="step-button-right">
                {isVerified && <img src={verifiedIcon} alt="Verified Icon" className="step-button-verified" />}
                <img src={arrowIcon} alt="Arrow Icon" className="step-button-arrow" />
            </div>
        </button>
    );
};

StepButton.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    paragraph: PropTypes.string.isRequired,
    isVerified: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

export default memo(StepButton);
