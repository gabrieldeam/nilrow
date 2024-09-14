import React, { useEffect, useState } from 'react';
import Categories from '../../../pages/Main/Categories/Categories';
import './ModalCategories.css'; 

const ModalCategories = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Duration matches the CSS animation duration
  };

  useEffect(() => {
    // Prevent body from scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="modal-categories-overlay" onClick={handleClose}>
      <div
        className={`modal-categories-content ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={handleClose}>X</button>
        <Categories onClose={handleClose} /> {/* Pass handleClose as onClose prop */}
      </div>
    </div>
  );
};

export default ModalCategories;
