'use client';

import React, { memo, forwardRef } from 'react';
import Image from 'next/image';
import { CategoryListProps } from '../../../types/components/UI/CategoryList';
import { FaGripVertical } from 'react-icons/fa';
import styles from './CategoryList.module.css';
import verifiedIcon from '../../../../public/assets/verificacao.svg';
import arrowIcon from '../../../../public/assets/setadireito.svg';

const CategoryList = forwardRef<HTMLDivElement, CategoryListProps>(
  ({ icon, customIcon, title, paragraph, isVerified = false, onClick, className = '', dragHandleProps }, ref) => {
    return (
      <div ref={ref} className={`${styles.categoryList} ${className}`}>
        <div className={styles.categoryListLeft}>
          <div {...dragHandleProps} className={styles.dragHandle}>
            <FaGripVertical />
          </div>
          <div className={styles.categoryListIconCircle}>
            {customIcon ? (
              <Image src={customIcon || '/assets/default-icon.svg'} alt="Custom Icon" className={styles.categoryListCustomIcon} width={51} height={51} />
            ) : (
              <Image src={icon || '/assets/default-icon.svg'} alt="Step Icon" className={styles.categoryListIcon} width={24} height={24} />
            )}
          </div>
          <div className={styles.categoryListText}>
            <h3>{title}</h3>
            <p>{paragraph}</p>
          </div>
        </div>
        <div className={styles.categoryListRight} onClick={onClick}>
          {isVerified && (
            <Image src={verifiedIcon} alt="Verified Icon" className={styles.categoryListVerified} width={20} height={20} />
          )}
          <Image src={arrowIcon} alt="Arrow Icon" className={styles.categoryListArrow} width={20} height={20} />
        </div>
      </div>
    );
  }
);

CategoryList.displayName = 'CategoryList';
export default memo(CategoryList);
