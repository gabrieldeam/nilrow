import React, { useEffect, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import './Notification.css';
import avisoIcon from '../../../assets/aviso.svg';

const Notification = ({ message, onClose, backgroundColor = '#DF1414' }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 5000); // 20 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = useCallback(() => {
        setVisible(false);
        onClose();
    }, [onClose]);

    if (!visible) {
        return null;
    }

    return (
        <div className="notification" style={{ backgroundColor }}>
            <div className="notification-content">
                <div className="notification-icon">
                    <img src={avisoIcon} alt="Aviso" loading="lazy" />
                </div>
                <span>{message}</span>
                <button className="notification-close" onClick={handleClose}>×</button>
            </div>
        </div>
    );
};

Notification.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    backgroundColor: PropTypes.string,
};

export default memo(Notification);
