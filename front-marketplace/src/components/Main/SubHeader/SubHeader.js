import React from 'react';
import PropTypes from 'prop-types';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import './SubHeader.css';

const SubHeader = ({ title, handleBack }) => {
    return (
        <div className="sub-header">
            <div className="sub-header-content">
                <div className="sub-header-info">
                    <div className="sub-header-buttons">                     
                        <HeaderButton icon={closeIcon} onClick={handleBack} />
                    </div>
                    <h1 className="sub-header-title roboto-medium">{title}</h1>
                </div>
            </div>
        </div>
    );
};

SubHeader.propTypes = {
    title: PropTypes.string.isRequired,
    handleBack: PropTypes.func
};

export default SubHeader;
