'use client';

import React from "react";
import { SubHeaderProps } from "../../../types/components/Layout/SubHeader";
import styles from "./SubHeader.module.css";
import HeaderButton from "../../../components/UI/HeaderButton/HeaderButton";
import closeIcon from "../../../../public/assets/close.svg";
import trashIcon from "../../../../public/assets/trash.svg";
import ordersIcon from "../../../../public/assets/orders.svg";
import checkWhite from "../../../../public/assets/check-white.svg";
import templateIcon from "../../../../public/assets/template.svg";
import SearchLayout from "../../../components/UI/SearchLayout/SearchLayout";

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  handleBack,
  handleDelete,
  showDeleteButton = false,
  showOrdersButton = false,
  handleOrders,
  showActiveFilterButton = false,
  handleActiveFilter,
  showTemplateButton = false, 
  handleTemplate,
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
}) => {
  return (
    <div className={styles.subHeader}>
      <div className={styles.subHeaderContent}>
        <div className={styles.subHeaderInfo}>
          <div className={styles.subHeaderButtons}>
            <HeaderButton icon={closeIcon} onClick={handleBack} />
            {showDeleteButton && <HeaderButton icon={trashIcon} onClick={handleDelete} />}
            {showOrdersButton && <HeaderButton icon={ordersIcon} onClick={handleOrders} />}
            {showActiveFilterButton && <HeaderButton icon={checkWhite} onClick={handleActiveFilter} />}
            {showTemplateButton && <HeaderButton icon={templateIcon} onClick={handleTemplate} />}
          </div>
          {showSearch ? (
            <div className={styles.searchWrapper}>
              <SearchLayout
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange || (() => {})}
                onSubmit={onSearchSubmit || (() => {})}
              />
            </div>
          ) : (
            <h1 className={`${styles.subHeaderTitle} roboto-medium`}>{title}</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
