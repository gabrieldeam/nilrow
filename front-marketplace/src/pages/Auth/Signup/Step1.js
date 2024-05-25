import React from 'react';

const Step1 = ({ formData, setFormData, nextStep }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <h2>Etapa 1: Cadastro do E-mail e Telefone</h2>
            <form>
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
                <button type="button" onClick={nextStep}>Próxima Etapa</button>
            </form>
        </div>
    );
};

export default Step1;
