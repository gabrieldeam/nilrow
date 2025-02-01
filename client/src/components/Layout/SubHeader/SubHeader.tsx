"use client";

import React from "react";
import Image from "next/image";
import { SubHeaderProps } from "../../../types/components/Layout/SubHeader";
import styles from "./SubHeader.module.css";
import HeaderButton from "../../..//components/UI/HeaderButton/HeaderButton";
import closeIcon from "@/assets/close.svg";
import trashIcon from "@/assets/trash.svg";
import ordersIcon from "@/assets/orders.svg";

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  handleBack,
  handleDelete,
  showDeleteButton = false,
  showOrdersButton = false,
  handleOrders,
}) => {
  return (
    <div className={styles.subHeader}>
      <div className={styles.subHeaderContent}>
        <div className={styles.subHeaderInfo}>
          <div className={styles.subHeaderButtons}>
            <HeaderButton icon={closeIcon} onClick={handleBack} />
            {showDeleteButton && <HeaderButton icon={trashIcon} onClick={handleDelete} />}
            {showOrdersButton && <HeaderButton icon={ordersIcon} onClick={handleOrders} />}
          </div>
          <h1 className={`${styles.subHeaderTitle} roboto-medium`}>{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
