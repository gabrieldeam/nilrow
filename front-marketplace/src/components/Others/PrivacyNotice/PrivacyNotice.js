import React, { memo } from 'react';
import './PrivacyNotice.css';
import privatIcon from '../../../assets/privat.svg';

const PrivacyNotice = () => {
    return (
        <div className="privacy-notice">
            <img src={privatIcon} alt="Privacy Icon" className="privacy-icon" loading="lazy" />
            <span>Ao continuar, aceito os 
                <a href="/termos-e-condicoes" className="privacy-link"> Termos e condições </a> 
                e autorizo o uso dos meus dados de acordo com a 
                <a href="/politica-de-privacidade" className="privacy-link"> Política de privacidade</a>.
            </span>
        </div>
    );
};

export default memo(PrivacyNotice);
