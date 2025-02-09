import React, { memo, useCallback } from "react";
import styles from "./SubButton.module.css";
import { ISubButtonProps } from "../../../types/components/UI/subButton";
import Image from "next/image";

const SubButton: React.FC<ISubButtonProps> = ({
  text,
  backgroundColor = "#7B33E5",
  onClick = () => {},
  imageSrc = null,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
    },
    [onClick]
  );

  return (
    <button
      className={styles.subButton}
      style={{ backgroundColor }}
      onClick={handleClick}
    >
      {imageSrc && (
        <Image src={imageSrc} alt="icon" className={styles.subButtonIcon} width={16} height={16} />
      )}
      {text}
    </button>
  );
};

export default memo(SubButton);
