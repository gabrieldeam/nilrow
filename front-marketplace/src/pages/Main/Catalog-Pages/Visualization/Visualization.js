import React, { memo, useCallback, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import './Visualization.css';
import { NotificationContext } from '../../../../context/NotificationContext';

const MapComponent = ({ handleAreaDrawn, handleAreaDeleted }) => {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize(); // Corrige o tamanho do mapa após o carregamento
    }, [map]);

    return (
        <>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={handleAreaDrawn}
                    onDeleted={handleAreaDeleted}
                    draw={{
                        rectangle: true,
                        polygon: true,
                        circle: false,
                        marker: false,
                        polyline: false,
                        circlemarker: false,
                    }}
                />
            </FeatureGroup>
        </>
    );
};

const Visualization = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const { setMessage } = useContext(NotificationContext);
    const [deliveryAreas, setDeliveryAreas] = useState([]);
    const [mapHeight, setMapHeight] = useState(window.innerHeight * 0.6);

    const handleBack = useCallback(() => {
        navigate('/my-catalog');
    }, [navigate]);

    const handleAreaDrawn = (e) => {
        const layer = e.layer;
        const newArea = layer.getLatLngs();
        setDeliveryAreas(prevAreas => [...prevAreas, newArea]);
        setMessage('Área de entrega adicionada com sucesso!', 'success');
    };

    const handleAreaDeleted = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const deletedArea = layer.getLatLngs();
            setDeliveryAreas(prevAreas => prevAreas.filter(area => area !== deletedArea));
        });
        setMessage('Área de entrega removida.', 'info');
    };

    useEffect(() => {
        const handleResize = () => {
            setMapHeight(window.innerHeight * 0.6);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
                <div className="map-container" style={{ height: `${mapHeight}px` }}>
                    <MapContainer
                        center={[-23.55052, -46.633308]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <MapComponent 
                            handleAreaDrawn={handleAreaDrawn} 
                            handleAreaDeleted={handleAreaDeleted} 
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default memo(Visualization);
