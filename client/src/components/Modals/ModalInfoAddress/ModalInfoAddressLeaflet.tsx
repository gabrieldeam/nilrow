'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './ModalInfoAddress.module.css';

import { useLocationContext } from '../../../context/LocationContext';
import { ModalInfoAddressProps } from '../../../types/components/Modals/ModalInfoAddress';

import markerIcon from '../../../../public/assets/marker.svg';
import closeIcon from '../../../../public/assets/close.svg';

// Componente que "re-centra" o mapa quando a localização muda
const CenterMap = memo(({ location }: { location: { latitude: number; longitude: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude], 12);
  }, [location, map]);
  return null;
});

const ModalInfoAddressLeaflet: React.FC<ModalInfoAddressProps> = ({ buttonPosition }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { location } = useLocationContext();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Exemplo: exibir esse modal apenas na 1ª visita
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

  // Configura nosso ícone de marcador (Leaflet)
  const marker = new L.Icon({
    iconUrl: markerIcon.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div ref={modalRef} className={styles['modal-info-address']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-map']}>
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '105px', width: '160px' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.latitude, location.longitude]} icon={marker}>
              <Popup>
                {location.city}, {location.state}
              </Popup>
            </Marker>
            <CenterMap location={location} />
          </MapContainer>
        </div>
        <div className={styles['modal-text']}>
          <h2 className="roboto-medium">Confira o seu endereço</h2>
          <p className="roboto-regular">
            Inclua seu CEP para uma melhor experiência para você
          </p>
          <div className={styles['modal-buttons']}>
            <a href="/update-address" className={styles['modal-link']}>
              Informe um CEP
            </a>
          </div>
        </div>
        <button className={styles['modal-close']} onClick={handleClose}>
          <img src={closeIcon.src} alt="Close" className={styles['close-icon']} loading="lazy" />
        </button>
      </div>
    </div>
  );
};

export default memo(ModalInfoAddressLeaflet);
