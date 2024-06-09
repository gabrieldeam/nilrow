import React, { useEffect, useState, useContext, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './ModalInfoAddress.css';
import { LocationContext } from '../../../context/LocationContext';
import markerIcon from '../../../assets/marker.svg';
import closeIcon from '../../../assets/close.svg';

const CenterMap = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([location.latitude, location.longitude], 12);
    }, [location, map]);
    return null;
};

const ModalInfoAddress = ({ buttonPosition }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { location } = useContext(LocationContext);
    const modalRef = useRef(null);

    useEffect(() => {
        const isFirstVisit = localStorage.getItem('isFirstVisit') === null;
        if (isFirstVisit) {
            setIsVisible(true);
            localStorage.setItem('isFirstVisit', 'false');
        }

        if (modalRef.current) {
            modalRef.current.style.top = `${buttonPosition.top + 15}px`;
            modalRef.current.style.left = `${buttonPosition.left}px`;
        }
    }, [buttonPosition]);

    const marker = new L.Icon({
        iconUrl: markerIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (!isVisible) {
        return null;
    }

    return (
        <div ref={modalRef} className="modal-info-address">
            <div className="modal-content">
                <div className="modal-map">
                    <MapContainer 
                        center={[location.latitude, location.longitude]} 
                        zoom={13} 
                        scrollWheelZoom={false} 
                        style={{ height: "105px", width: "160px" }}
                        zoomControl={false}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[location.latitude, location.longitude]} icon={marker}>
                            <Popup>
                                {location.city}, {location.state}
                            </Popup>
                        </Marker>
                        <CenterMap location={location} />
                    </MapContainer>
                </div>
                <div className="modal-text">
                    <h2 className="roboto-medium">Confira o seu endereço</h2>
                    <p className="roboto-regular">Inclua seu CEP para uma melhor experiência para você</p>
                    <div className="modal-buttons">
                        <a href="/update-address" className="modal-link">Informe um CEP</a>
                    </div>
                </div>
                <button className="modal-close" onClick={() => setIsVisible(false)}>
                    <img src={closeIcon} alt="Close" className="close-icon" />
                </button>
            </div>
        </div>
    );
};

export default ModalInfoAddress;
