'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FAQExpandableCardProps } from '../../../types/components/UI/FAQExpandableCard';
import styles from './FAQExpandableCard.module.css';
import rightArrowIcon from '../../../../public/assets/setadireito.svg';

const FAQExpandableCard: React.FC<FAQExpandableCardProps> = ({ question, answer }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleExpand = () => {
        setIsExpanded((prevState) => !prevState);
    };

    return (
        <div className={styles.faqExpandableCardContainer}>
            <div className={styles.faqExpandableCardHeader} onClick={toggleExpand}>
                <h3 className={styles.faqExpandableCardTitle}>{question}</h3>
                <Image 
                    src={rightArrowIcon} 
                    alt="Toggle expand" 
                    className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} 
                />
            </div>
            {isExpanded && <div className={styles.faqExpandableCardText}>{answer}</div>}
        </div>
    );
};

export default FAQExpandableCard;
