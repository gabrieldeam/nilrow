import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../context/NotificationContext'; // Certifique-se de que o caminho está correto
import Notification from '../components/UI/Notification/Notification';
import Header from '../components/Auth/Header/Header';
import Footer from '../components/Auth/Footer/Footer';

const Home = () => {
    const { message, setMessage } = useContext(NotificationContext);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000); // Duração da notificação
            return () => clearTimeout(timer); // Limpar o timer ao desmontar
        }
    }, [message, setMessage]);

    return (
        <div>
            <Header/>
            {message && <Notification message={message} onClose={() => setMessage('')} backgroundColor="#4FBF0A" />}
            <h1>Home</h1>
            <Footer/>
        </div>
    );
};

export default Home;
