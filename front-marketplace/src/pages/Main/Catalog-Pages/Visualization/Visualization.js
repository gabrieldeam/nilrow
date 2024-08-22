import React, { useState, useCallback, useContext, memo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import Card from '../../../../components/UI/Card/Card';
import './Visualization.css';
import { NotificationContext } from '../../../../context/NotificationContext';
import 'leaflet/dist/leaflet.css';
import includeIconSrc from '../../../../assets/include.svg';
import excludeIconSrc from '../../../../assets/exclude.svg';

const Visualization = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const { setMessage } = useContext(NotificationContext);
    const [searchHistory, setSearchHistory] = useState([]);
    const [positions, setPositions] = useState([]);
    const [includedPolygons, setIncludedPolygons] = useState([]);
    const [excludedPolygons, setExcludedPolygons] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState('');
    const [action, setAction] = useState('include');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const suggestionsRef = useRef(null);
    const mapRef = useRef(); // Referência para o mapa

    // Fechar o contêiner de sugestões ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Criar instâncias de ícones personalizados
    const includeIcon = new L.Icon({
        iconUrl: includeIconSrc,
        iconSize: [32, 32], // Tamanho do ícone
        iconAnchor: [16, 32], // Ponto de ancoragem do ícone (meio inferior)
        popupAnchor: [0, -32], // Ponto de ancoragem do popup
    });

    const excludeIcon = new L.Icon({
        iconUrl: excludeIconSrc,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const handleBack = useCallback(() => {
        navigate('/my-catalog');
    }, [navigate]);

    const handleSearch = async (query) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&polygon_geojson=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, geojson } = data[0];
                const newPosition = [parseFloat(lat), parseFloat(lon)];
                setPositions((prev) => [...prev, newPosition]);
                setSearchHistory((prev) => [query, ...prev]);

                // Move o mapa para a nova posição
                if (mapRef.current) {
                    mapRef.current.setView(newPosition, 13); // Ajuste o nível de zoom conforme necessário
                }

                if (geojson && geojson.type === 'Polygon') {
                    const coordinates = geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
                    if (action === 'include') {
                        setIncludedPolygons((prev) => [...prev, coordinates]);
                    } else if (action === 'exclude') {
                        setExcludedPolygons((prev) => [...prev, coordinates]);
                    }
                } else if (geojson && geojson.type === 'MultiPolygon') {
                    const coordinates = geojson.coordinates.flat().map(polygon => polygon.map(coord => [coord[1], coord[0]]));
                    if (action === 'include') {
                        setIncludedPolygons((prev) => [...prev, ...coordinates]);
                    } else if (action === 'exclude') {
                        setExcludedPolygons((prev) => [...prev, ...coordinates]);
                    }
                }

                setMessage(`Área marcada para: ${query}`);
                setSuggestions([]);
            } else {
                setMessage({ type: 'error', text: `Nenhum resultado encontrado para: ${query}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao buscar a localização. Tente novamente.' });
        }
    };

    const handleInputChange = async (e) => {
        const query = e.target.value;
        setQuery(query);

        if (query.length > 2) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                setMessage({ type: 'error', text: 'Erro ao buscar sugestões de localização. Tente novamente.' });
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSearch(suggestion.display_name);
    };

    const highlightMatch = (text, query) => {
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <span key={index} className="highlight">{part}</span>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </>
        );
    };

    const handleActionChange = (newAction) => {
        setAction(newAction);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen((prevOpen) => !prevOpen);
    };

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
                <Card title="Localizações">
                    <div className="visualization-input-group">
                        <div className="dropdown-container" ref={dropdownRef}>
                            <div className="dropdown-selected" onClick={toggleDropdown}>
                                {action === 'include' ? (
                                    <>
                                        <img src={includeIconSrc} alt="Include" className="dropdown-icon" />
                                        Incluir
                                    </>
                                ) : (
                                    <>
                                        <img src={excludeIconSrc} alt="Exclude" className="dropdown-icon" />
                                        Excluir
                                    </>
                                )}
                            </div>
                            {dropdownOpen && (
                                <div className="dropdown-options">
                                    <div onClick={() => handleActionChange('include')} className="dropdown-option">
                                        <img src={includeIconSrc} alt="Include" className="dropdown-icon" />
                                        Incluir
                                    </div>
                                    <div onClick={() => handleActionChange('exclude')} className="dropdown-option">
                                        <img src={excludeIconSrc} alt="Exclude" className="dropdown-icon" />
                                        Excluir
                                    </div>
                                </div>
                            )}
                        </div>
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(e.target.value);
                                }
                            }} 
                            className="visualization-search-input"
                        />
                    </div>
                    <div className="suggestions-container" ref={suggestionsRef}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {highlightMatch(suggestion.display_name, query)}
                            </div>
                        ))}
                    </div>                    
                    <div className="visualization-map-container">
                        <MapContainer center={positions[positions.length - 1] || [51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }} ref={mapRef}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {positions.map((pos, index) => (
                                <Marker 
                                    key={index} 
                                    position={pos}
                                    icon={action === 'include' ? includeIcon : excludeIcon}
                                >
                                    <Popup>
                                        {action === 'include' ? "Área incluída" : "Área excluída"}
                                    </Popup>
                                </Marker>
                            ))}
                            {includedPolygons.map((polygon, index) => (
                                <Polygon key={index} positions={polygon} color="blue" />
                            ))}
                            {excludedPolygons.map((polygon, index) => (
                                <Polygon key={index} positions={polygon} color="red" />
                            ))}
                        </MapContainer>
                    </div>
                    <div className="visualization-search-history">
                        {searchHistory.map((item, index) => (
                            <div key={index} className="visualization-search-item">{item}</div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(Visualization);
