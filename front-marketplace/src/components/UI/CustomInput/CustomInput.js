import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import './CustomInput.css';
import eyeIcon from '../../../assets/olho.svg';
import eyeOffIcon from '../../../assets/olhos-cruzado.svg';

const CustomInput = ({
    title,
    placeholder = '',
    bottomLeftText = '',
    bottomRightLink = null,
    onChange,
    value = '',
    type = 'text',
    name = '',
    isValid,
    prefix,
    readOnly = false,
    checkbox = null // Adicionado checkbox
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible((prevState) => !prevState);
    }, []);

    return (
        <div className="custom-input-container">
            {title && <label className="input-title">{title}</label>}
            <div className="input-wrapper">
                {prefix && <span className="input-prefix">{prefix}</span>}
                <input 
                    type={isPasswordVisible && type === 'password' ? 'text' : type}
                    className={`custom-input ${isValid === true ? 'valid' : isValid === false ? 'invalid' : ''} ${readOnly ? 'read-only' : ''}`} 
                    placeholder={placeholder} 
                    onChange={onChange} 
                    value={value}
                    name={name}
                    style={{ paddingLeft: prefix ? '106px' : '14px' }} // Ajuste condicional do padding
                    readOnly={readOnly} // Adicionado readOnly
                />
                {type === 'password' && (
                    <img 
                        src={isPasswordVisible ? eyeIcon : eyeOffIcon} 
                        alt="Toggle visibility" 
                        className="visibility-icon" 
                        onClick={togglePasswordVisibility} 
                    />
                )}
                {checkbox && (
                    <div className="custom-input-checkbox-container roboto-light">
                        <input 
                            type="checkbox" 
                            checked={checkbox.checked} 
                            onChange={checkbox.onChange} 
                        />
                        <label>{checkbox.label}</label>
                    </div>
                )}
            </div>
            <div className="input-bottom-text">
                {bottomLeftText && <span className="bottom-left">{bottomLeftText}</span>}
                {bottomRightLink && <a href={bottomRightLink.href} className="bottom-right">{bottomRightLink.text}</a>}
            </div>
        </div>
    );
};

CustomInput.propTypes = {
    title: PropTypes.string,
    placeholder: PropTypes.string,
    bottomLeftText: PropTypes.string,
    bottomRightLink: PropTypes.shape({
        href: PropTypes.string,
        text: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string,
    isValid: PropTypes.bool,
    prefix: PropTypes.string,
    readOnly: PropTypes.bool, // Adicionado readOnly 
    checkbox: PropTypes.shape({ // Adicionado checkbox
        checked: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
        label: PropTypes.string.isRequired
    })
};

export default memo(CustomInput);
