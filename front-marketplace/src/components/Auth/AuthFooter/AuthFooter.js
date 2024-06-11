import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import './AuthFooter.css';

const Footer = ({ initialOpenState = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpenState);

    useEffect(() => {
        setIsOpen(initialOpenState);
    }, [initialOpenState]);

    const toggleFooter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`authfooter-container ${isOpen ? 'open' : 'closed'}`}>
            <button className="toggle-button roboto-medium" onClick={toggleFooter}>
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

Footer.propTypes = {
    initialOpenState: PropTypes.bool
};

export default memo(Footer);
