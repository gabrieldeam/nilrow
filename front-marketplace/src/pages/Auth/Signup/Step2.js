import React from 'react';
import { useNavigate } from 'react-router-dom';

const Step2 = ({ formData, setFormData, handleStepCompletion }) => {
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
            <h2>Etapa 2: Informações Pessoais</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="birthDate"
                    placeholder="Data de Nascimento"
                    value={formData.birthDate}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="nickname"
                    placeholder="Nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                />
                <button type="submit">Salvar e Voltar</button>
            </form>
        </div>
    );
};

export default Step2;
