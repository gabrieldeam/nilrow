import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import './CodeInput.css';

const CodeInput = ({ length, onChange }) => {
    const [values, setValues] = useState(Array(length).fill(''));
    const inputsRef = useRef([]);

    useEffect(() => {
        onChange(values.join(''));
    }, [values, onChange]);

    const handleChange = useCallback((e, index) => {
        const newValues = [...values];
        newValues[index] = e.target.value.slice(-1);
        setValues(newValues);
        if (e.target.value && index < length - 1) {
            inputsRef.current[index + 1].focus();
        }
    }, [values, length]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').slice(0, length).split('');
        const newValues = [...values];
        paste.forEach((char, i) => {
            newValues[i] = char;
        });
        setValues(newValues);
        const nextIndex = paste.length < length ? paste.length : length - 1;
        inputsRef.current[nextIndex].focus();
    }, [values, length]);

    const handleKeyDown = useCallback((e, index) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    }, [values]);

    return (
        <div className="code-input-container">
            {values.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => inputsRef.current[index] = el}
                    className="code-input"
                />
            ))}
        </div>
    );
};

CodeInput.propTypes = {
    length: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default memo(CodeInput);
