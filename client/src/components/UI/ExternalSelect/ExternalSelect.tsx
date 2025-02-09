import React, { memo } from "react";
import styles from "./ExternalSelect.module.css";
import { IExternalSelectProps } from "../../../types/components/UI/ExternalSelect";

const ExternalSelect: React.FC<IExternalSelectProps> = ({
  title,
  placeholder = "",
  bottomLeftText = "",
  bottomRightLink = null,
  onChange,
  value = "",
  name = "",
  isValid,
  prefix,
  readOnly = false,
  options = [],
}) => {
  return (
    <div className={styles.customInputContainer}>
      {title && <label className={styles.inputTitle}>{title}</label>}
      <div className={styles.inputWrapper}>
        {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
        <select
          className={`${styles.customInput} ${
            isValid === true ? styles.valid : isValid === false ? styles.invalid : ""
          } ${readOnly ? styles.readOnly : ""}`}
          onChange={onChange}
          value={value}
          name={name}
          disabled={readOnly}
          style={{ paddingLeft: prefix ? "106px" : "14px" }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.inputBottomText}>
        {bottomLeftText && <span className={styles.bottomLeft}>{bottomLeftText}</span>}
        {bottomRightLink && (
          <a href={bottomRightLink.href} className={styles.bottomRight}>
            {bottomRightLink.text}
          </a>
        )}
      </div>
    </div>
  );
};

export default memo(ExternalSelect);
