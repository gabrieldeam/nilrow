import React from "react";
import styles from "./ImageModal.module.css";
import { IImageModalProps } from "../../../types/components/Modals/ImageModal";
import Image from "next/image";

const ImageModal: React.FC<IImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent}>
        <Image src={imageUrl} alt="Expanded" className={styles.modalImage} width={600} height={600} />
      </div>
    </div>
  );
};

export default ImageModal;