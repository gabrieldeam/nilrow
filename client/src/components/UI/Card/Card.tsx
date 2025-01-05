import React, { memo } from 'react';
import styles from './Card.module.css';
import { CardProps } from '../../../types/components/UI/Card';

const Card: React.FC<CardProps> = ({ title, children, leftLink, rightLink, rightButton }) => {
  return (
    <div className={styles.cardContainer}>
      {title && (
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{title}</h2>
          <div className={styles.cardLinks}>
            {leftLink && (
              <a href={leftLink.href} className={styles.leftLink}>
                {leftLink.text}
              </a>
            )}
            {rightLink && (
              <a href={rightLink.href} className={styles.rightLink}>
                {rightLink.text}
              </a>
            )}
            {rightButton && (
              <button
                type="button"
                onClick={rightButton.onClick}
                className={styles.rightLinkButton}
              >
                {rightButton.text}
              </button>
            )}
          </div>
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export default memo(Card);
