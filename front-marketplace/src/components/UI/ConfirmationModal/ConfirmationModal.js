import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './ConfirmationModal.css';
import StageButton from '../../UI/Buttons/StageButton/StageButton';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message='Você tem certeza que deseja continuar?' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }

        return () => {
            document.body.classList.remove('body-no-scroll');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-container">
                <div className="confirmation-modal-content">
                    <h2 className="confirmation-modal-title roboto-medium">Confirmação</h2>
                    <p className="confirmation-modal-description roboto-regular">
                        {message}
                    </p>
                    <div className="confirmation-modal-actions">
                        <StageButton
                            text="Confirmar"
                            backgroundColor="#DF1414"
                            onClick={onConfirm}
                        />
                        <StageButton
                            text="Cancelar"
                            backgroundColor="#212121"
                            onClick={onCancel}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    message: PropTypes.string,
};

export default ConfirmationModal;
