import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ExpandableCard.css';
import rightArrowIcon from '../../../assets/setadireito.svg';

const ExpandableCard = ({ title, children, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    useEffect(() => {
        setIsExpanded(defaultExpanded);
    }, [defaultExpanded]);

    const toggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <div className="expandable-card-container">
            {title && (
                <div className="expandable-card-header" onClick={toggleExpand}>
                    <h2 className="expandable-card-title">{title}</h2>
                    <img 
                        src={rightArrowIcon} 
                        alt="Toggle expand" 
                        className={`expand-icon ${isExpanded ? 'expanded' : ''}`}                         
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
    defaultExpanded: PropTypes.bool, // Novo prop para definir o estado inicial
};

export default ExpandableCard;
