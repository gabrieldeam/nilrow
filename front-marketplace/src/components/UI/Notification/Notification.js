import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Notification.css';
import avisoIcon from '../../../assets/aviso.svg';

const Notification = ({ message, onClose, backgroundColor = '#DF1414' }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 20000); // 20 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) {
        return null;
    }

    return (
        <div className="notification" style={{ backgroundColor }}>
            <div className="notification-content">
                <div className="notification-icon">
                    <img src={avisoIcon} alt="Aviso" />
                </div>
                <span>{message}</span>
                <button className="notification-close" onClick={() => { setVisible(false); onClose(); }}>×</button>
            </div>
        </div>
    );
};

Notification.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    backgroundColor: PropTypes.string,
};

export default Notification;
