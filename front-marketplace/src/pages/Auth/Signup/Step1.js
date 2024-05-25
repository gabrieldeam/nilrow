import React from 'react';
import { useNavigate } from 'react-router-dom';

const Step1 = ({ formData, setFormData, handleStepCompletion }) => {
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
            <h2>Etapa 1: Cadastro do E-mail e Telefone</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <button type="submit">Salvar e Voltar</button>
            </form>
        </div>
    );
};

export default Step1;
