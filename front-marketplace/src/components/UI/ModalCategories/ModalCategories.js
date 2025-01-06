import React, { useEffect, useState } from 'react';
import Categories from '../../../pages/Main/Categories/Categories';
import './ModalCategories.css'; 

const ModalCategories = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); 
  };

  useEffect(() => {
 
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
        <Categories onClose={handleClose} />
      </div>
    </div>
  );
};

export default ModalCategories;
