/* src/components/Auth/Header/Header.js */

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import logo from '../../../assets/nilrow.svg';
import infoIcon from '../../../assets/informacoes.svg';

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <Link to="/">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
            </div>
            <div className="header-right">
                <HeaderButton 
                    text="Feedback e ajuda"
                    icon={infoIcon}
                />
            </div>
        </header>
    );
}

export default Header;
