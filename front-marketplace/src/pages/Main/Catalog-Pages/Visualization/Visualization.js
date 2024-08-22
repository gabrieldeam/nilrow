import React, { useState, useCallback, useContext, memo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { debounce } from 'lodash';
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

    const [locations, setLocations] = useState(() => {
        const savedLocations = localStorage.getItem('locations');
        return savedLocations ? JSON.parse(savedLocations) : [];
    });

    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState('');
    const [action, setAction] = useState('include');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const suggestionsRef = useRef(null);
    const mapRef = useRef();

    useEffect(() => {
        localStorage.setItem('locations', JSON.stringify(locations));
    }, [locations]);

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

    const includeIcon = new L.Icon({
        iconUrl: includeIconSrc,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
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

                const newLocation = {
                    name: query,
                    position: newPosition,
                    includedPolygons: [],
                    excludedPolygons: [],
                    action: action, // Adiciona a ação para identificar se é include ou exclude
                };

                const bounds = [newPosition];

                if (geojson && geojson.type === 'Polygon') {
                    const coordinates = geojson.coordinates[0].map(coord => [coord[1], coord[0]]);
                    bounds.push(...coordinates);
                    if (action === 'include') {
                        newLocation.includedPolygons.push(coordinates);
                    } else if (action === 'exclude') {
                        newLocation.excludedPolygons.push(coordinates);
                    }
                } else if (geojson && geojson.type === 'MultiPolygon') {
                    const coordinates = geojson.coordinates.flat().map(polygon => polygon.map(coord => [coord[1], coord[0]]));
                    bounds.push(...coordinates);
                    if (action === 'include') {
                        newLocation.includedPolygons.push(...coordinates);
                    } else if (action === 'exclude') {
                        newLocation.excludedPolygons.push(...coordinates);
                    }
                }

                setLocations((prev) => [newLocation, ...prev]);

                if (mapRef.current && bounds.length > 1) {
                    mapRef.current.fitBounds(bounds);
                } else if (mapRef.current) {
                    mapRef.current.setView(newPosition, 13);
                }

                setSuggestions([]);
            } else {
                setMessage({ type: 'error', text: `Nenhum resultado encontrado para: ${query}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao buscar a localização. Tente novamente.' });
        }
    };

    // Mova o debounce para fora do useCallback
    const debouncedFetchSuggestions = debounce(async (query, setSuggestions, setMessage) => {
        if (query.length > 2) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                setMessage({ type: 'error', text: 'Erro ao buscar sugestões de localização. Tente novamente.' });
                console.error('Error fetching location suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    }, 300);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setQuery(query);
        debouncedFetchSuggestions(query, setSuggestions, setMessage);
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

    const handleRemoveRegion = (index) => {
        setLocations((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFocusRegion = (index) => {
        const location = locations[index];
        if (location && mapRef.current) {
            const bounds = [];

            bounds.push(location.position);

            location.includedPolygons.forEach(polygon => {
                bounds.push(...polygon);
            });
            location.excludedPolygons.forEach(polygon => {
                bounds.push(...polygon);
            });

            if (bounds.length > 0) {
                mapRef.current.fitBounds(bounds);
            }
        }
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
                    <MapContainer
                        center={locations[locations.length - 1]?.position || [-14.235, -51.9253]}
                        zoom={locations.length > 0 ? 13 : 3} 
                        style={{ height: '500px', width: '100%' }}
                        ref={mapRef}
                    >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {locations.map((location, index) => (
                                <Marker 
                                    key={index} 
                                    position={location.position}
                                    icon={location.action === 'include' ? includeIcon : excludeIcon}
                                >
                                    <Popup>
                                        {location.name}
                                    </Popup>
                                </Marker>
                            ))}
                            {locations.map((location, index) => (
                                location.includedPolygons.map((polygon, i) => (
                                    <Polygon key={`included-${index}-${i}`} positions={polygon} color="blue" />
                                ))
                            ))}
                            {locations.map((location, index) => (
                                location.excludedPolygons.map((polygon, i) => (
                                    <Polygon key={`excluded-${index}-${i}`} positions={polygon} color="red" />
                                ))
                            ))}
                        </MapContainer>
                    </div>
                    <div className="visualization-search-history">
                        {locations.map((location, index) => (
                            <div 
                                key={index} 
                                className="visualization-search-item"
                                onClick={() => handleFocusRegion(index)}
                            >
                                <img 
                                    src={location.action === 'include' ? includeIconSrc : excludeIconSrc} 
                                    alt={location.action} 
                                    className="search-history-icon"
                                    style={{ marginRight: '8px', width: '20px', height: '20px' }}
                                />
                                <span>{location.name}</span>
                                <button 
                                    className="remove-region-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveRegion(index);
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(Visualization);
