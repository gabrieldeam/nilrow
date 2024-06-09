import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileFooter.css';
import homeIcon from '../../../assets/home.svg';
import searchIcon from '../../../assets/search.svg';
import createIcon from '../../../assets/create.svg';
import chatIcon from '../../../assets/chat.svg';
import profileIcon from '../../../assets/profile.svg';
import ProtectedLink from '../../Others/ProtectedRoute/ProtectedLink';

const MobileFooter = () => {
    const location = useLocation();

    const getIconClass = (path) => {
        return location.pathname === path ? 'footer-icon active' : 'footer-icon';
    };

    return (
        <footer className="mobile-footer">
            <Link to="/" className={getIconClass('/')}>
                <img src={homeIcon} alt="Home" />
            </Link>
            <Link to="/search" className={getIconClass('/search')}>
                <img src={searchIcon} alt="Search" />
            </Link>
            <ProtectedLink to="/create">
                <div className={getIconClass('/create')}>
                    <img src={createIcon} alt="Create" />
                </div>
            </ProtectedLink>
            <ProtectedLink to="/chat">
                <div className={getIconClass('/chat')}>
                    <img src={chatIcon} alt="Chat" />
                </div>
            </ProtectedLink>
            <ProtectedLink to="/profile">
                <div className={getIconClass('/profile')}>
                    <img src={profileIcon} alt="Profile" />
                </div>
            </ProtectedLink>
        </footer>
    );
};

export default MobileFooter;
