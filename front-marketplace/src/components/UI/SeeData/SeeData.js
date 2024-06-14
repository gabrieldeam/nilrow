import React from 'react';
import PropTypes from 'prop-types';
import './SeeData.css';

const SeeData = ({ title, content }) => {
    return (
        <div className="see-data-container">
            <div className="see-data-title">
                {title}
            </div>
            <div className="see-data-content">
                {content}
            </div>
        </div>
    );
};

SeeData.propTypes = {
    title: PropTypes.string,
    content: PropTypes.string,
};

export default SeeData;
