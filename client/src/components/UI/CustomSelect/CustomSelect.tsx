import React, { memo } from "react";
import { CustomSelectProps } from "@/types/components/UI/CustomSelect";
import styles from "./CustomSelect.module.css";

const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            times.push(time);
        }
    }
    return times;
};

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
    readOnly = false
}) => {
    const timeOptions = generateTimeOptions();

    return (
        <div className={styles.customInputContainer}>
            {title && <label className={styles.inputTitle}>{title}</label>}
            <div className={styles.inputWrapper}>
                {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
                <select
                    className={`${styles.customInput} 
                        ${isValid === true ? styles.valid : isValid === false ? styles.invalid : ""} 
                        ${readOnly ? styles.readOnly : ""}`}
                    onChange={onChange}
                    value={value}
                    name={name}
                    disabled={readOnly}
                    style={{ paddingLeft: prefix ? "106px" : "14px" }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
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
