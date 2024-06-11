import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import './DateInput.css';

const DateInput = ({ title, onChange, value, name, bottomLeftText = '' }) => {
    const options = {
        month: [...Array(12).keys()].map(i => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
        day: [...Array(31).keys()].map(i => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') })),
        year: [...Array(100).keys()].map(i => {
            const year = 2024 - i;
            return { value: String(year), label: String(year) };
        }),
    };

    const handleMonthChange = useCallback((selectedOption) => {
        const dateParts = value.split('-');
        const newDate = `${dateParts[0] || '2024'}-${selectedOption.value}-${dateParts[2] || '01'}`;
        onChange({ target: { name, value: newDate } });
    }, [value, name, onChange]);

    const handleDayChange = useCallback((selectedOption) => {
        const dateParts = value.split('-');
        const newDate = `${dateParts[0] || '2024'}-${dateParts[1] || '01'}-${selectedOption.value}`;
        onChange({ target: { name, value: newDate } });
    }, [value, name, onChange]);

    const handleYearChange = useCallback((selectedOption) => {
        const dateParts = value.split('-');
        const newDate = `${selectedOption.value}-${dateParts[1] || '01'}-${dateParts[2] || '01'}`;
        onChange({ target: { name, value: newDate } });
    }, [value, name, onChange]);

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: '#000000',
            color: '#ffffff',
            borderColor: '#ffffff',
            height: '40px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#ffffff',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#ffffff',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#000000',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#7B33E5' : '#000000',
            color: '#ffffff',
        }),
    };

    return (
        <div className="date-input-container">
            {title && <label className="date-input-title">{title}</label>}
            <div className="date-input-wrapper">
                <div className="select-container">
                    <label className="select-title">Dia</label>
                    <Select
                        className="date-input"
                        classNamePrefix="select"
                        onChange={handleDayChange}
                        options={options.day}
                        placeholder=""
                        value={options.day.find(option => option.value === value.split('-')[2])}
                        styles={customStyles}
                    />
                </div>
                <div className="select-container">
                    <label className="select-title">Mês</label>
                    <Select
                        className="date-input"
                        classNamePrefix="select"
                        onChange={handleMonthChange}
                        options={options.month}
                        placeholder=""
                        value={options.month.find(option => option.value === value.split('-')[1])}
                        styles={customStyles}
                    />
                </div>
                <div className="select-container">
                    <label className="select-title">Ano</label>
                    <Select
                        className="date-input"
                        classNamePrefix="select"
                        onChange={handleYearChange}
                        options={options.year}
                        placeholder=""
                        value={options.year.find(option => option.value === value.split('-')[0])}
                        styles={customStyles}
                    />
                </div>
            </div>
            {bottomLeftText && <span className="date-bottom-left">{bottomLeftText}</span>}
        </div>
    );
};

DateInput.propTypes = {
    title: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    bottomLeftText: PropTypes.string,
};

export default memo(DateInput);
