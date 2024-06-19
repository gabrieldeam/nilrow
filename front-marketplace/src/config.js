const config = {
    development: {
        apiUrl: 'http://localhost:8080/api',
    },
    production: {
        apiUrl: 'https://seu-backend-em-producao.com/api',
    },
};

const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return config[env];
};

export default getConfig;