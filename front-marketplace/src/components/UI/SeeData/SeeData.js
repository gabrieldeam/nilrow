import React from 'react';
import PropTypes from 'prop-types';
import './SeeData.css';
import ToggleButton from '../../UI/Buttons/ToggleButton/ToggleButton';
import verifiedIcon from '../../../assets/verificacao.svg'; 

const SeeData = ({ title, content, subContent, link, linkText, onClick, stackContent = false, showToggleButton = false, onToggle, toggled, showIcon = false }) => {
  return (
    <div className={`see-data-container ${stackContent ? 'stack-content' : ''}`}>
      <div className="see-data-main">
        <div className="see-data-title">
          {title}
        </div>
        {showIcon && <img src={verifiedIcon} alt="Verified" className="see-data-verified-icon" />} {/* Ícone condicional */}
        <div className="see-data-content ellipsis">
          {content}
        </div>
        {subContent && (
          <div className="see-data-sub-content">
            {subContent}
          </div>
        )}
      </div>
      <div className="see-data-actions">
        {link && linkText && (
          <a href={link} className="see-data-link">
            {linkText}
          </a>
        )}
        {onClick && linkText && !link && (
          <button className="see-data-button" onClick={onClick}>
            {linkText}
          </button>
        )}
        {showToggleButton && <ToggleButton onToggle={onToggle} initial={toggled} />}
      </div>
    </div>
  );
};

SeeData.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  subContent: PropTypes.string, 
  link: PropTypes.string,
  linkText: PropTypes.string,
  onClick: PropTypes.func,
  stackContent: PropTypes.bool,
  showToggleButton: PropTypes.bool,
  onToggle: PropTypes.func,
  toggled: PropTypes.bool,
  showIcon: PropTypes.bool,
};

export default SeeData;
