'use client';

import React, { FC } from 'react';
import postSectionStyles from './postSection.module.css';

const PostSection: FC = () => {
  return (
    <div className={postSectionStyles.container}>
      <div className={postSectionStyles.emptyPostContainer}>
        <p>Este canal ainda não tem publicações</p>
      </div>
    </div>
  );
};

export default PostSection;
