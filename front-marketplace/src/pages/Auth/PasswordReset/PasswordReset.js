import React from 'react';
import './PasswordReset.css';
import Header from '../../../components/Auth/Header/Header';
import Footer from '../../../components/Auth/Footer/Footer';

const PasswordReset = () => {
    return (
        <div className="password-reset-page">
            <Header />
            <div className="password-reset-container">
                <h1>Redefinir Senha</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <button type="submit" className="btn">Enviar</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default PasswordReset;
