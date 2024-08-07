import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './CustomSelect.css';

const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            times.push(time);
        }
    }
    return times;
};

const CustomSelect = ({
    title,
    placeholder = '',
    bottomLeftText = '',
    bottomRightLink = null,
    onChange,
    value = '',
    name = '',
    isValid,
    prefix,
    readOnly = false
}) => {
    const timeOptions = generateTimeOptions();

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
                    {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
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

CustomSelect.propTypes = {
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
    readOnly: PropTypes.bool
};

export default memo(CustomSelect);
