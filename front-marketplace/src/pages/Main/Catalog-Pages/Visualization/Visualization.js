import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import './Visualization.css';

const Visualization = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate('/my-catalog'); 
    }, [navigate]);

    return (
        <div className="visualization-page">
            <Helmet>
                <title>Visualização</title>
                <meta name="description" content="Visualize os dados detalhados do catálogo." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Visualização" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="visualization-container">
                <div className="visualization-header">
                    <SubHeader title="Visualização" handleBack={handleBack} />
                </div>            
            </div>
        </div>
    );
};

export default memo(Visualization);
