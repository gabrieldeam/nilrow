import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CustomInput.css';
import eyeIcon from '../../../assets/olho.svg';
import eyeOffIcon from '../../../assets/olhos-cruzado.svg';

const CustomInput = ({ title, placeholder = '', bottomLeftText = '', bottomRightLink = null, onChange, value, type = 'text' }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className="custom-input-container">
            {title && <label className="input-title">{title}</label>}
            <div className="input-wrapper">
                <input 
                    type={isPasswordVisible && type === 'password' ? 'text' : type}
                    className="custom-input" 
                    placeholder={placeholder} 
                    onChange={onChange} 
                    value={value}
                />
                {type === 'password' && (
                    <img 
                        src={isPasswordVisible ? eyeIcon : eyeOffIcon} 
                        alt="Toggle visibility" 
                        className="visibility-icon" 
                        onClick={togglePasswordVisibility} 
                    />
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
    value: PropTypes.string.isRequired,
    type: PropTypes.string
};

export default CustomInput;