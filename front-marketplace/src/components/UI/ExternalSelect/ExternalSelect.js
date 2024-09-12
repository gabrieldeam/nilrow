import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './ExternalSelect.css';

const ExternalSelect = ({
    title,
    placeholder = '',
    bottomLeftText = '',
    bottomRightLink = null,
    onChange,
    value = '',
    name = '',
    isValid,
    prefix,
    readOnly = false,
    options = [] // Lista de opções externas
}) => {
    return (
        <div className="custom-input-container">
            {title && <label className="input-title">{title}</label>}
            <div className="input-wrapper">
                {prefix && <span className="input-prefix">{prefix}</span>}
                <select
                    className={`custom-input ${isValid === true ? 'valid' : isValid === false ? 'invalid' : ''} ${readOnly ? 'read-only' : ''}`} 
                    onChange={onChange} 
                    value={value}
                    name={name}
                    disabled={readOnly}
                    style={{ paddingLeft: prefix ? '106px' : '14px' }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="input-bottom-text">
                {bottomLeftText && <span className="bottom-left">{bottomLeftText}</span>}
                {bottomRightLink && <a href={bottomRightLink.href} className="bottom-right">{bottomRightLink.text}</a>}
            </div>
        </div>
    );
};

ExternalSelect.propTypes = {
    title: PropTypes.string,
    placeholder: PropTypes.string,
    bottomLeftText: PropTypes.string,
    bottomRightLink: PropTypes.shape({
        href: PropTypes.string,
        text: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    name: PropTypes.string,
    isValid: PropTypes.bool,
    prefix: PropTypes.string,
    readOnly: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })).isRequired
};

export default memo(ExternalSelect);
