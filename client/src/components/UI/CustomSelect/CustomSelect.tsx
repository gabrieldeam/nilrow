import React, { memo } from "react";
import { CustomSelectProps } from "@/types/components/UI/CustomSelect";
import styles from "./CustomSelect.module.css";

const CustomSelect: React.FC<CustomSelectProps> = ({
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
  options,
  onLoadMore,
  hasMore
}) => {
  // Handler que intercepta a mudança
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "load-more") {
      // Se selecionou "Ver mais", chama o onLoadMore e não altera o valor selecionado
      onLoadMore && onLoadMore();
      return;
    }
    onChange(e);
  };

  return (
    <div className={styles.customInputContainer}>
      {title && <label className={styles.inputTitle}>{title}</label>}
      <div className={styles.inputWrapper}>
        {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
        <select
          className={`
            ${styles.customInput} 
            ${isValid === true ? styles.valid : isValid === false ? styles.invalid : ""} 
            ${readOnly ? styles.readOnly : ""}
          `}
          onChange={handleSelectChange}
          value={value}
          name={name}
          disabled={readOnly}
          style={{ paddingLeft: prefix ? "106px" : "14px" }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {/* Renderiza o "Ver mais" somente se houver mais itens */}
          {hasMore && onLoadMore && (
            <option value="load-more">
              Ver mais
            </option>
          )}
        </select>
      </div>
      <div className={styles.inputBottomText}>
        {bottomLeftText && <span className={styles.bottomLeft}>{bottomLeftText}</span>}
        {bottomRightLink && <a href={bottomRightLink.href} className={styles.bottomRight}>{bottomRightLink.text}</a>}
      </div>
    </div>
  );
};

export default memo(CustomSelect);
