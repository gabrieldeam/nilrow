import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './AuthHeader.css';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import logo from '../../../assets/nilrow.svg';
import infoIcon from '../../../assets/informacoes.svg';

const AuthHeader = () => {
    return (
        <header className="authheader">
            <div className="authheader-left">
                <Link to="/">
                    <img src={logo} alt="Logo" className="authlogo" loading="lazy" />
                </Link>
            </div>
            <div className="authheader-right">
                <HeaderButton 
                    text="Feedback e ajuda"
                    icon={infoIcon}
                    link="http://google.com"
                    newTab={true}
                />
            </div>
        </header>
    );
}

export default memo(AuthHeader);
