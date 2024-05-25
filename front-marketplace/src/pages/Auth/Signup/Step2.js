import React from 'react';

const Step2 = ({ formData, setFormData, nextStep }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <h2>Etapa 2: Informações Pessoais</h2>
            <form>
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
                <button type="button" onClick={nextStep}>Próxima Etapa</button>
            </form>
        </div>
    );
};

export default Step2;
