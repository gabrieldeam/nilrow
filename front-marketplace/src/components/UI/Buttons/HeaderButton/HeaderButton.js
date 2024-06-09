import React from 'react';
import PropTypes from 'prop-types';
import './HeaderButton.css';

const HeaderButton = React.forwardRef(({ text, icon, link, newTab = false, isActive = false }, ref) => {
    const handleClick = () => {
        if (link) {
            const isExternal = link.startsWith('http://') || link.startsWith('https://');
            if (isExternal) {
                if (newTab) {
                    window.open(link, '_blank');
                } else {
                    window.location.href = link;
                }
            } else {
                if (newTab) {
                    window.open(link, '_blank');
                } else {
                    window.location.href = link;
                }
            }
        }
    };

    return (
        <button
            className={`custom-button roboto-regular ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            ref={ref}
        >
            {icon && <img src={icon} alt="icon" className={`button-icon ${text ? 'with-text' : ''}`} />}
            <span>{text}</span>
        </button>
    );
});

HeaderButton.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.string,
    link: PropTypes.string,
    newTab: PropTypes.bool,
    isActive: PropTypes.bool,
};

export default HeaderButton;
