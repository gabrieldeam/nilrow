import React from 'react';

const SignupStep3 = ({ prevStep }) => {
    return (
        <div>
            <h2>Criar sua Senha</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Senha:</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required />
                </div>
                <button type="button" className="btn" onClick={prevStep}>Voltar</button>
                <button type="submit" className="btn">Cadastrar</button>
            </form>
        </div>
    );
};

export default SignupStep3;
