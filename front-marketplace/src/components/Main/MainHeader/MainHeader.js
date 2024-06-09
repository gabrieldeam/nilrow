import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './MainHeader.css';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import LoginButton from '../../UI/Buttons/LoginButton/LoginButton';
import ProtectedLink from '../../Others/ProtectedRoute/ProtectedLink';
import logo from '../../../assets/nilrow.svg';
import searchIcon from '../../../assets/search.svg';
import createIcon from '../../../assets/create.svg';
import addressIcon from '../../../assets/address.svg';
import bagIcon from '../../../assets/bag.svg';
import chatIcon from '../../../assets/chat.svg';
import profileIcon from '../../../assets/profile.svg';
import useAuth from '../../../hooks/useAuth';

const MainHeader = () => {
    const { isAuthenticated } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}`);
        } else {
            navigate(`/search`);
        }
    };

    const getIsActive = (path) => location.pathname === path;

    return (
        <header className="mainheader">
            <div className="mainheader-left">
                <Link to="/">
                    <img src={logo} alt="Logo" className="mainlogo" />
                </Link>
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <button type="submit" className="search-button">
                        <img src={searchIcon} alt="Search" />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="search-input" 
                    />
                </form>
            </div>
            <div className="mainheader-right">
                <ProtectedLink to="/create">
                    <HeaderButton icon={createIcon} isActive={getIsActive('/create')} />
                </ProtectedLink>
                <HeaderButton icon={addressIcon} link="/address" text="Address" isActive={getIsActive('/address')} />
                <ProtectedLink to="/bag">
                    <HeaderButton icon={bagIcon} isActive={getIsActive('/bag')} />
                </ProtectedLink>
                {isAuthenticated && (
                    <>
                        <HeaderButton icon={chatIcon} link="/chat" isActive={getIsActive('/chat')} />
                        <HeaderButton icon={profileIcon} link="/profile" isActive={getIsActive('/profile')} />
                    </>
                )}
                {!isAuthenticated && <LoginButton text="Login" link="/login" />}
            </div>
        </header>
    );
}

export default MainHeader;
