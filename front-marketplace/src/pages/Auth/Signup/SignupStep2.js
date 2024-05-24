import React from 'react';

const SignupStep2 = ({ nextStep, prevStep }) => {
    return (
        <div>
            <h2>Dados Pessoais</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="firstName">Primeiro Nome:</label>
                    <input type="text" id="firstName" name="firstName" required />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Sobrenome:</label>
                    <input type="text" id="lastName" name="lastName" required />
                </div>
                <button type="button" className="btn" onClick={prevStep}>Voltar</button>
                <button type="button" className="btn" onClick={nextStep}>Próximo</button>
            </form>
        </div>
    );
};

export default SignupStep2;
