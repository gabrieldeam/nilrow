import React from 'react';
import { useNavigate } from 'react-router-dom';

const Step3 = ({ formData, setFormData, handleStepCompletion }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        handleStepCompletion();
        navigate('/signup');
    };

    return (
        <div>
            <h2>Etapa 3: Criar Senha</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    name="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar Senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <button type="submit">Salvar e Voltar</button>
            </form>
        </div>
    );
};

export default Step3;
