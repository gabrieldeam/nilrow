import React from 'react';

const SignupStep1 = ({ nextStep }) => {
    return (
        <div>
            <h2>Adicionar Email e Telefone</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Telefone:</label>
                    <input type="tel" id="phone" name="phone" required />
                </div>
                <button type="button" className="btn" onClick={nextStep}>Próximo</button>
            </form>
        </div>
    );
};

export default SignupStep1;
