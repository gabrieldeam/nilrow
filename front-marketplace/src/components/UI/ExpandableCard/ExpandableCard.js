import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ExpandableCard.css';
import rightArrowIcon from '../../../assets/setadireito.svg';

const ExpandableCard = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <div className="expandable-card-container">
            {title && (
                <div className="expandable-card-header">
                    <h2 className="expandable-card-title">{title}</h2>
                    <img 
                        src={rightArrowIcon} 
                        alt="Toggle expand" 
                        className={`expand-icon ${isExpanded ? 'expanded' : ''}`} 
                        onClick={toggleExpand} 
                    />
                </div>
            )}
            {isExpanded && <div className="expandable-card-content">{children}</div>}
        </div>
    );
};

ExpandableCard.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default ExpandableCard;
