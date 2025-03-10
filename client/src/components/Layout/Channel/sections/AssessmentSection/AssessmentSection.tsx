'use client';

import React, { FC } from 'react';
import Image from 'next/image';
import assessmentSectionStyles from './assessmentSection.module.css';

const AssessmentSection: FC = () => {
  return (
    <div className={assessmentSectionStyles.container}>
      <div className={assessmentSectionStyles.testScrollContainer}>
        <h2>Assessment Section</h2>
        <Image
          src="https://www.showmetech.com.br/wp-content/uploads//2017/05/e-commerce-no-Brasil.jpg"
          alt="Test Scroll"
          className={assessmentSectionStyles.testImage}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
};

export default AssessmentSection;
