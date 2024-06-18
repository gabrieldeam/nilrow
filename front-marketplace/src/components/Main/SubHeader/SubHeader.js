import React from 'react';
import PropTypes from 'prop-types';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import trashIcon from '../../../assets/trash.svg';
import './SubHeader.css';

const SubHeader = ({ title, handleBack, handleDelete, showDeleteButton = false }) => {
    return (
        <div className="sub-header">
            <div className="sub-header-content">
                <div className="sub-header-info">
                    <div className="sub-header-buttons">
                        <HeaderButton icon={closeIcon} onClick={handleBack} />
                        {showDeleteButton && (
                            <HeaderButton icon={trashIcon} onClick={handleDelete} />
                        )}
                    </div>
                    <h1 className="sub-header-title roboto-medium">{title}</h1>
                </div>
            </div>
        </div>
    );
};

SubHeader.propTypes = {
    title: PropTypes.string.isRequired,
    handleBack: PropTypes.func,
    handleDelete: PropTypes.func,
    showDeleteButton: PropTypes.bool
};


export default SubHeader;
