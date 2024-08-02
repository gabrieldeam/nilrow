import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FAQExpandableCard.css';
import rightArrowIcon from '../../../assets/setadireito.svg';

const FAQExpandableCard = ({ question, answer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <div className="faq-expandable-card-container">
            <div className="faq-expandable-card-header" onClick={toggleExpand}>
                <h3 className="faq-expandable-card-title roboto-regular">{question}</h3>
                <img 
                    src={rightArrowIcon} 
                    alt="Toggle expand" 
                    className={`expand-icon ${isExpanded ? 'expanded' : ''}`}                         
                />
            </div>
            {isExpanded && <div className="faq-expandable-card-text roboto-regular">{answer}</div>}
        </div>
    );
};

FAQExpandableCard.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
};

export default FAQExpandableCard;
