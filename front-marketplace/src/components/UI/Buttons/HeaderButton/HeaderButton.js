import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import './HeaderButton.css';

const HeaderButton = React.forwardRef(({ text, icon, link, newTab = false, isActive = false, onClick }, ref) => {
    const handleClick = useCallback(() => {
        if (onClick) {
            onClick();
        } else if (link) {
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
    }, [link, newTab, onClick]);

    return (
        <button
            className={`custom-button roboto-regular ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            ref={ref}
        >
            {icon && <img src={icon} alt="icon" className={`button-icon ${text ? 'with-text' : ''}`} loading="lazy" />}
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
    onClick: PropTypes.func,
};

export default memo(HeaderButton);
