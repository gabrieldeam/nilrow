import React from "react";
import styles from "./Modal.module.css";
import { IModalProps } from "../../../types/components/Modals/Modal";
import Image from "next/image";
import closeIcon from "../../../../public/assets/close.svg";

const Modal: React.FC<IModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          <Image src={closeIcon} alt="Close" className={styles.closeIcon} width={20} height={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
