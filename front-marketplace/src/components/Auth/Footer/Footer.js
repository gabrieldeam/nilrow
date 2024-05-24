import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Footer.css';

const Footer = ({ initialOpenState = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpenState);

    useEffect(() => {
        setIsOpen(initialOpenState);
    }, [initialOpenState]);

    const toggleFooter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`footer-container ${isOpen ? 'open' : 'closed'}`}>
            <button className="toggle-button roboto-medium" onClick={toggleFooter}>
                {isOpen ? 'Menos informações' : 'Mais informações'}
            </button>
            {isOpen && (
                <div className="footer-content">
                    <p>Aqui vão as informações detalhadas do rodapé...</p>
                </div>
            )}
        </div>
    );
};

Footer.propTypes = {
    initialOpenState: PropTypes.bool
};

export default Footer;
