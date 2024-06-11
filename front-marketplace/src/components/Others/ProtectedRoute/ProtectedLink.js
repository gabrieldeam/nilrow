import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../../hooks/useAuth';

const ProtectedLink = ({ to, children }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleClick = useCallback((e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate(to);
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate, to]);

    return (
        <a href={to} onClick={handleClick}>
            {children}
        </a>
    );
};

ProtectedLink.propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default memo(ProtectedLink);
