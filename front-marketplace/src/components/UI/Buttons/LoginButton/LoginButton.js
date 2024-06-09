import React from 'react';
import PropTypes from 'prop-types';
import './LoginButton.css';

const LoginButton = ({ text, link, onClick }) => {
    return (
        <a href={link} className="login-button" onClick={onClick}>
            {text}
        </a>
    );
};

LoginButton.propTypes = {
    text: PropTypes.string.isRequired,
    link: PropTypes.string,
    onClick: PropTypes.func,
};

export default LoginButton;
