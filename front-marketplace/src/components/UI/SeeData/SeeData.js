import React from 'react';
import PropTypes from 'prop-types';
import './SeeData.css';

const SeeData = ({ title, content, link, linkText, onClick, stackContent = false }) => {
    return (
        <div className={`see-data-container ${stackContent ? 'stack-content' : ''}`}>
            <div className="see-data-main">
                <div className="see-data-title">
                    {title}
                </div>
                <div className="see-data-content">
                    {content}
                </div>
            </div>
            {link && linkText && (
                <a href={link} className="see-data-link" onClick={onClick}>
                    {linkText}
                </a>
            )}
        </div>
    );
};

SeeData.propTypes = {
    title: PropTypes.string,
    content: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string,
    onClick: PropTypes.func,
    stackContent: PropTypes.bool, // Adicionando a nova prop aqui
};

export default SeeData;
