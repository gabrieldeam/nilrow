import React, { useState } from 'react';
import './HomeSubHeader.css';
import ontheriseIcon from '../../../assets/ontherise.svg';
import followingIcon from '../../../assets/following.svg';
import curationIcon from '../../../assets/curation.svg';

const HomeSubHeader = ({ onButtonClick }) => {
    const [activeButton, setActiveButton] = useState(null);

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
            <div 
                className={`home-sub-header-item ${activeButton === 'following' ? 'active' : ''}`} 
                onClick={() => handleButtonClick('following')}
            >
                <div className="home-sub-header-button">
                    <img src={followingIcon} alt="Seguidores" className="home-sub-header-icon" />
                </div>
                <span className="home-sub-header-text">Seguidores</span>
            </div>
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
