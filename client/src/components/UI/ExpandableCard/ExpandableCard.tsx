'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExpandableCardProps } from '../../../types/components/UI/ExpandableCard';
import styles from './ExpandableCard.module.css';
import rightArrowIcon from '../../../../public/assets/setadireito.svg';

const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, children, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

    useEffect(() => {
        setIsExpanded(defaultExpanded);
    }, [defaultExpanded]);

    const toggleExpand = () => {
        setIsExpanded((prevState) => !prevState);
    };

    return (
        <div className={styles.expandableCardContainer}>
            {title && (
                <div className={styles.expandableCardHeader} onClick={toggleExpand}>
                    <h2 className={styles.expandableCardTitle}>{title}</h2>
                    <Image 
                        src={rightArrowIcon} 
                        alt="Toggle expand" 
                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} 
                    />
                </div>
            )}
            {isExpanded && <div className={styles.expandableCardContent}>{children}</div>}
        </div>
    );
};

export default ExpandableCard;
