import React, { useCallback, memo } from 'react';
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

    const getIconClass = useCallback((path) => {
        return location.pathname === path ? 'footer-icon active' : 'footer-icon';
    }, [location.pathname]);

    return (
        <footer className="mobile-footer">
            <Link to="/" className={getIconClass('/')}>
                <img src={homeIcon} loading="lazy" alt="Home" />
            </Link>
            <Link to="/search" className={getIconClass('/search')}>
                <img src={searchIcon} loading="lazy" alt="Search" />
            </Link>
            <ProtectedLink to="/create">
                <div className={getIconClass('/create')}>
                    <img src={createIcon} loading="lazy" alt="Create" />
                </div>
            </ProtectedLink>
            <ProtectedLink to="/chat">
                <div className={getIconClass('/chat')}>
                    <img src={chatIcon} loading="lazy" alt="Chat" />
                </div>
            </ProtectedLink>
            <ProtectedLink to="/profile">
                <div className={getIconClass('/profile')}>
                    <img src={profileIcon} loading="lazy" alt="Profile" />
                </div>
            </ProtectedLink>
        </footer>
    );
};

export default memo(MobileFooter);
