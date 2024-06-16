import React from 'react';
import PropTypes from 'prop-types';
import './SearchLayout.css';
import searchMobileIcon from '../../../assets/search-mobile.svg';

const SearchLayout = ({ placeholder, value, onChange }) => {
    return (
        <div className="search-layout-form">
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
        </div>
    );
};

SearchLayout.propTypes = {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default SearchLayout;
