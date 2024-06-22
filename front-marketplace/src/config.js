const config = {
    development: {
        apiUrl: 'http://localhost:8080/api',
        frontUrl: 'http://localhost:3000/@', // Adicione a URL do front-end para desenvolvimento
    },
    production: {
        apiUrl: 'https://nilrow.com/api',
        frontUrl: 'https://nilrow.com/@', // Adicione a URL do front-end para produção
    },
};

const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return config[env];
};

export default getConfig;
