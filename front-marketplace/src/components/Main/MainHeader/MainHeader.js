import React, { useState, useContext, useEffect, useRef, useCallback, memo } from 'react';
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
import scanIcon from '../../../assets/scan.svg';
import adminIcon from '../../../assets/admin.svg'; // Importe o ícone de admin
import useAuth from '../../../hooks/useAuth';

import { LocationContext } from '../../../context/LocationContext';
import { useSearch } from '../../../context/SearchContext';

import { isAdmin } from '../../../services/api'; // Importe a função isAdmin

import ModalInfoAddress from '../../Others/ModalInfoAddres/ModalInfoAddress';
import AddressModal from '../../Others/AddressModal/AddressModal';

const MainHeader = () => {
    const { isAuthenticated } = useAuth();
    const { location } = useContext(LocationContext);
    const { searchTerm, setSearchTerm } = useSearch();
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false); // Estado para armazenar se o usuário é admin
    const [showScanButton, setShowScanButton] = useState(false);
    const navigate = useNavigate();
    const currentLocation = useLocation();
    const addressButtonRef = useRef(null);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isAuthenticated) {
            const checkAdminStatus = async () => {
                try {
                    const response = await isAdmin();
                    setIsAdminUser(response); // Defina isAdminUser com o resultado
                } catch (error) {
                    console.error('Erro ao verificar status de admin:', error);
                }
            };

            checkAdminStatus();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (addressButtonRef.current) {
            const rect = addressButtonRef.current.getBoundingClientRect();
            setButtonPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        }
    }, []);

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
            searchHistory = searchHistory.filter(term => term !== searchTerm);
            searchHistory.unshift(searchTerm);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 10)));

            navigate(`/search?q=${searchTerm}`);
        } else {
            navigate(`/search`);
        }
    }, [navigate, searchTerm]);

    const getIsActive = useCallback((path) => currentLocation.pathname === path, [currentLocation.pathname]);

    const openAddressModal = () => {
        setIsAddressModalOpen(true);
    };

    const closeAddressModal = () => {
        setIsAddressModalOpen(false);
    };

    return (
        <header className="mainheader">
            <div className="mainheader-left">
                <Link to="/">
                    <img src={logo} alt="Logo" className="mainlogo" />
                </Link>
                <form 
                    className="search-form" 
                    onSubmit={handleSearchSubmit}
                    onMouseEnter={() => setShowScanButton(true)}
                    onMouseLeave={() => setShowScanButton(false)}
                >
                    <button type="submit" className="search-button">
                        <img src={searchIcon} alt="Search" />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Pesquisar..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="search-input roboto-medium" 
                        onFocus={() => setShowScanButton(true)}
                        onBlur={() => setShowScanButton(false)}
                    />
                    {showScanButton && (
                        <div className="scan-button">
                            <HeaderButton icon={scanIcon} />
                        </div>
                    )}
                </form>
            </div>
            <div className="mainheader-right">
                <ProtectedLink to="/create">
                    <HeaderButton icon={createIcon} isActive={getIsActive('/create')} />
                </ProtectedLink>
                <HeaderButton 
                    id="address-button" 
                    ref={addressButtonRef} 
                    icon={addressIcon} 
                    onClick={openAddressModal} 
                    text={location.city ? `${location.city} - ${location.zip}` : "Atualizar local"}  
                />
                <ProtectedLink to="/bag">
                    <HeaderButton icon={bagIcon} isActive={getIsActive('/bag')} />
                </ProtectedLink>
                {isAuthenticated && (
                    <>
                        <HeaderButton icon={chatIcon} link="/chat" isActive={getIsActive('/chat')} />
                        <HeaderButton icon={profileIcon} link="/profile" isActive={getIsActive('/profile')} />
                        {isAdminUser && ( 
                            <HeaderButton icon={adminIcon} link="/admin" isActive={getIsActive('/admin')} />
                        )}
                    </>
                )}
                {!isAuthenticated && <LoginButton text="Login" link="/login" />}
            </div>
            <ModalInfoAddress buttonPosition={buttonPosition} />
            <AddressModal isOpen={isAddressModalOpen} onClose={closeAddressModal} />
        </header>
    );
};

export default memo(MainHeader);
