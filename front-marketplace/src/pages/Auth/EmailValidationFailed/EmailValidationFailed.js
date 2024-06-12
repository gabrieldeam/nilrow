import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './EmailValidationFailed.css';
import failedImage from '../../../assets/email-validation-failed.png';

const EmailValidationFailed = () => {
    return (
        <div className="email-validation-failed-outer-container">
            <Helmet>
                <title>Email Validation Failed</title>
            </Helmet>
            <div className="email-validation-failed-inner-container">
                <img src={failedImage} alt="Email validation failed" className="email-validation-failed-image" />
                <h1 className="email-validation-failed-title roboto-black">Falha na Verificação do E-mail</h1>
                <p className="email-validation-failed-message roboto-regular">Ocorreu um problema ao verificar seu endereço de e-mail. Por favor, tente novamente ou entre em contato com o suporte.</p>
                <div className="email-validation-failed-link-container">
                    <Link to="/">Home</Link>
                </div>
            </div>
        </div>
    );
};

export default memo(EmailValidationFailed);
