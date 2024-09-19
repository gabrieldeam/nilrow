// CategoryList.js
import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './CategoryList.css';
import verifiedIcon from '../../../assets/verificacao.svg';
import arrowIcon from '../../../assets/setadireito.svg';
import { FaGripVertical } from 'react-icons/fa';

const CategoryList = forwardRef(({
    icon,
    customIcon,
    title,
    paragraph,
    isVerified = false,
    onClick,
    className,
    dragHandleProps
}, ref) => {
    return (
        <div ref={ref} className={`category-list ${className}`}>
            <div className="category-list-left">
                {/* Handle de arrasto movido para cá */}
                <FaGripVertical {...dragHandleProps} className="drag-handle" />
                <div className="category-list-icon-circle">
                    {customIcon ? (
                        <img src={customIcon} alt="Custom Icon" className="category-list-custom-icon" />
                    ) : (
                        <img src={icon} alt="Step Icon" className="category-list-icon" />
                    )}
                </div>
                <div className="category-list-text roboto-regular">
                    <h3>{title}</h3>
                    <p>{paragraph}</p>
                </div>
            </div>
            <div className="category-list-right" onClick={onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {isVerified && <img src={verifiedIcon} alt="Verified Icon" className="category-list-verified" />}
                <img src={arrowIcon} alt="Arrow Icon" className="category-list-arrow" />
            </div>
        </div>
    );
});

CategoryList.propTypes = {
    icon: PropTypes.string,
    customIcon: PropTypes.string,
    title: PropTypes.string.isRequired,
    paragraph: PropTypes.string,
    isVerified: PropTypes.bool,
    onClick: PropTypes.func,
    className: PropTypes.string,
    dragHandleProps: PropTypes.object
};

export default memo(CategoryList);
