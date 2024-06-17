import React from 'react';
import PropTypes from 'prop-types';
import './SearchLayout.css';
import searchMobileIcon from '../../../assets/search-mobile.svg';

const SearchLayout = ({ placeholder, value, onChange, onSubmit }) => {
    return (
        <form className="search-layout-form" onSubmit={onSubmit}>
            <button type="submit" className="search-layout-button">
                <img src={searchMobileIcon} alt="Search" />
            </button>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="search-layout-input roboto-medium"
            />
        </form>
    );
};

SearchLayout.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default SearchLayout;
