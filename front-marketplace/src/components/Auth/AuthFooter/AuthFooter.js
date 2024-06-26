import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import './AuthFooter.css';

const AuthFooter = ({ initialOpenState = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpenState);

    useEffect(() => {
        setIsOpen(initialOpenState);
    }, [initialOpenState]);

    const toggleFooter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`authfooter-container ${isOpen ? 'open' : 'closed'}`}>
            <button className="authfooter-toggle-button roboto-medium" onClick={toggleFooter}>
                {isOpen ? 'Menos informações' : 'Mais informações'}
            </button>
            {isOpen && (
                <div className="authfooter-content">
                    <p>Aqui vão as informações detalhadas do rodapé...</p>
                </div>
            )}
        </div>
    );
};

AuthFooter.propTypes = {
    initialOpenState: PropTypes.bool
};

export default memo(AuthFooter);
