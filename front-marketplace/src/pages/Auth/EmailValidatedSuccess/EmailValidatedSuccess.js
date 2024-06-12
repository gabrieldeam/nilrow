import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './EmailValidatedSuccess.css';
import successImage from '../../../assets/email-validated-success.png';

const EmailValidatedSuccess = () => {
    return (
        <div className="email-validated-success-outer-container">
            <Helmet>
                <title>Email Validation Success</title>
            </Helmet>
            <div className="email-validated-success-inner-container">
                <img src={successImage} alt="Email validated successfully" className="email-validated-success-image" />
                <h1 className="email-validated-success-title roboto-black">Email Verificado com Sucesso!</h1>
                <p className="email-validated-success-message roboto-regular">Seu endereço de e-mail foi verificado com sucesso. Agora você pode acessar todos os recursos da Nilrow.</p>
                <div className="email-validated-success-link-container">
                    <Link to="/">Home</Link>
                </div>
            </div>
        </div>
    );
};

export default memo(EmailValidatedSuccess);
