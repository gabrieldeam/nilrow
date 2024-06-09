import React from 'react';
import PropTypes from 'prop-types';
import './HeaderButton.css';

const HeaderButton = ({ text, icon, link, newTab = false, isActive = false }) => {
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
                // For internal links, use window.location or a router push if using a router library
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
        >
            {icon && <img src={icon} alt="icon" className={`button-icon ${text ? 'with-text' : ''}`} />}
            <span>{text}</span>
        </button>
    );
};

HeaderButton.propTypes = {
    text: PropTypes.string.isRequired,
    icon: PropTypes.string,
    link: PropTypes.string,
    newTab: PropTypes.bool,
    isActive: PropTypes.bool,
};

export default HeaderButton;
