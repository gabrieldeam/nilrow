import React from 'react';

const Step3 = ({ formData, setFormData, completeSignup }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <h2>Etapa 3: Criar Senha</h2>
            <form>
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
                <button type="button" onClick={completeSignup}>Concluir</button>
            </form>
        </div>
    );
};

export default Step3;
