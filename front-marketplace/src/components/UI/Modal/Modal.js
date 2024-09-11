import React from 'react';
import './Modal.css';
import closeIcon from '../../../assets/close.svg';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <img src={closeIcon} alt="Close" className="close-icon" />
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
