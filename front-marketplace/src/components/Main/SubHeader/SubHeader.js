import React from 'react';
import PropTypes from 'prop-types';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import trashIcon from '../../../assets/trash.svg';
import ordersIcon from '../../../assets/orders.svg';
import './SubHeader.css';

const SubHeader = ({ title, handleBack, handleDelete, showDeleteButton = false, showOrdersButton = false, handleOrders }) => {
    return (
        <div className="sub-header">
            <div className="sub-header-content">
                <div className="sub-header-info">
                    <div className="sub-header-buttons">
                        <HeaderButton icon={closeIcon} onClick={handleBack} />
                        {showDeleteButton && (
                            <HeaderButton icon={trashIcon} onClick={handleDelete} />
                        )}
                        {showOrdersButton && (
                            <HeaderButton icon={ordersIcon} onClick={handleOrders} />
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
    showDeleteButton: PropTypes.bool,
    showOrdersButton: PropTypes.bool,
    handleOrders: PropTypes.func,
};


export default SubHeader;
