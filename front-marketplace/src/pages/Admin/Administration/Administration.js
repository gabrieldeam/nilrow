import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import './Administration.css';
import cardIcon from '../../../assets/user.svg';
import createBlackIcon from '../../../assets/createBlack.svg';
import catalogIcon from '../../../assets/catalog.svg';
import LikesBlackIcon from '../../../assets/LikesBlack.svg';

const Administration = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-page">
            <Helmet>
                <title>Administration</title>
                <meta name="description" content="Administration na Nilrow." />
            </Helmet>
            <div className="profile-container">
                <div className="profile-content">
                <div className="additional-steps">
                    <StepButton
                        icon={cardIcon}
                        title="Usuários"
                        paragraph="Perfil público da sua conta, onde todos os usuários poderão te achar."
                        onClick={() => navigate('/address')}
                    />
                    <StepButton
                        icon={LikesBlackIcon}
                        title="Canais"
                        paragraph="Endereços de entrega salvos na sua conta"
                        onClick={() => navigate('/address')}
                    />
                    <StepButton
                        icon={catalogIcon}
                        title="Catalogos"
                        paragraph="Todos cartões usados para comprar salvos na sua conta."
                        onClick={() => navigate('/cards')}
                    />
                    <StepButton
                        icon={createBlackIcon}
                        title="Posts"
                        paragraph="Preferências e controle do uso dos seus dados."
                        onClick={() => navigate('/privacy')}
                    />
                </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Administration);