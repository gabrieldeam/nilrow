import React, { useState, useEffect } from 'react';
import './HomeSubHeader.css';
import ontheriseIcon from '../../../assets/ontherise.svg';
import followingIcon from '../../../assets/following.svg';
import curationIcon from '../../../assets/curation.svg';
import { checkAuth } from '../../../services/api';

const HomeSubHeader = ({ onButtonClick, activeSection }) => {
    const [activeButton, setActiveButton] = useState(activeSection);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setActiveButton(activeSection);
    }, [activeSection]);

    useEffect(() => {
        const verifyAuth = async () => {
            const authStatus = await checkAuth();
            setIsAuthenticated(authStatus.isAuthenticated);
        };

        verifyAuth();
    }, []);

    const handleButtonClick = (button) => {
        const newActiveButton = activeButton === button ? null : button;
        setActiveButton(newActiveButton);
        onButtonClick(newActiveButton);
    };

    return (
        <div className="home-sub-header">
            <div 
                className={`home-sub-header-item ${activeButton === 'ontherise' ? 'active' : ''}`} 
                onClick={() => handleButtonClick('ontherise')}
            >
                <div className="home-sub-header-button">
                    <img src={ontheriseIcon} alt="Em Alta" className="home-sub-header-icon" />
                </div>
                <span className="home-sub-header-text">Em Alta</span>
            </div>
            {isAuthenticated && (
                <div 
                    className={`home-sub-header-item ${activeButton === 'following' ? 'active' : ''}`} 
                    onClick={() => handleButtonClick('following')}
                >
                    <div className="home-sub-header-button">
                        <img src={followingIcon} alt="Seguindo" className="home-sub-header-icon" />
                    </div>
                    <span className="home-sub-header-text">Seguindo</span>
                </div>
            )}
            <div 
                className={`home-sub-header-item ${activeButton === 'curation' ? 'active' : ''}`} 
                onClick={() => handleButtonClick('curation')}
            >
                <div className="home-sub-header-button">
                    <img src={curationIcon} alt="Curadoria" className="home-sub-header-icon" />
                </div>
                <span className="home-sub-header-text">Curadoria</span>
            </div>
            <div className="home-sub-header-divider"></div>
        </div>
    );
};

export default HomeSubHeader;
