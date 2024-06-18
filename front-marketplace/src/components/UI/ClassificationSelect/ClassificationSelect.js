import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import './ClassificationSelect.css';

const ClassificationSelect = ({ classifications, selectedClassification, onChange }) => {
    const handleCheckboxChange = useCallback((name) => {
        if (selectedClassification === name) {
            onChange('');
        } else {
            onChange(name);
        }
    }, [selectedClassification, onChange]);

    return (
        <div className="classification-select-container">
            {classifications.map((classification, index) => (
                <div key={index} className="classification-item">
                    <span>{classification.value}</span>
                    <input
                        type="checkbox"
                        checked={selectedClassification === classification.name}
                        onChange={() => handleCheckboxChange(classification.name)}
                    />
                </div>
            ))}
        </div>
    );
};

ClassificationSelect.propTypes = {
    classifications: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
    })).isRequired,
    selectedClassification: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default ClassificationSelect;
