import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './LoginButton.css';

const LoginButton = ({ text, link, onClick }) => {
    const handleClick = useCallback((e) => {
        if (onClick) {
            e.preventDefault();
            onClick(e);
        }
    }, [onClick]);

    return (
        <a href={link} className="login-button" onClick={handleClick}>
            {text}
        </a>
    );
};

LoginButton.propTypes = {
    text: PropTypes.string.isRequired,
    link: PropTypes.string,
    onClick: PropTypes.func,
};

export default memo(LoginButton);
