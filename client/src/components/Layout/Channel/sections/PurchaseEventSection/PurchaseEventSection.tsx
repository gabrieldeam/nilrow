'use client';

import React, { FC } from 'react';
import Image from 'next/image';
import purchaseEventSectionStyles from './purchaseEventSection.module.css';

const PurchaseEventSection: FC = () => {
  return (
    <div className={purchaseEventSectionStyles.container}>
      <div className={purchaseEventSectionStyles.testScrollContainer}>
        <h2>Purchase Event Section</h2>
        <Image
          src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg"
          alt="Test Scroll"
          className={purchaseEventSectionStyles.testImage}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
};

export default PurchaseEventSection;
