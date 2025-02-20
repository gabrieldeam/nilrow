"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";

// Hooks do Next
import { useRouter, useSearchParams } from "next/navigation";

// Hooks/customs
import { useNotification } from "@/hooks/useNotification";

// React-Leaflet e estilos
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Lodash e serviços
import { debounce } from "lodash";
import {
  createLocation,
  getLocationsByCatalogId,
  deleteLocation,
} from "@/services/catalogService";

// Tipos
import { LocationData } from "@/types/services/catalog";

// Componentes de UI
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import Card from "@/components/UI/Card/Card";

// Ícones e estilos
import includeIconSrc from "../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../public/assets/exclude.svg";
import styles from "./Visualization.module.css";

// ---------------------------------------------------------------------
// Componente auxiliar para atualizar referência do mapa
function MapRefUpdater({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();
  useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  }, [map]);
  return null;
}

// ---------------------------------------------------------------------
// Componente principal (Client Component)
const VisualizationClient: React.FC = () => {
  // -------------------------------------------------------------------
  // 1) Chame todos os Hooks no TOPO, sem if/returns antes
  // -------------------------------------------------------------------

  // Hooks básicos de contexto/navegação
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();

  // Estado para carregar Leaflet dinamicamente
  const [leafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);

  // Estados do componente
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<"include" | "exclude">("include");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Referências
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // -------------------------------------------------------------------
  // 2) Efeitos e callbacks sempre chamados, sem condicional
  // -------------------------------------------------------------------

  // Efeito: carregar Leaflet no client
  useEffect(() => {
    import("leaflet").then((module) => {
      setLeafletModule(module);
    });
  }, []);

  // Efeito: obter catalogId de localStorage ou query param
  useEffect(() => {
    const storedCatalogId = typeof window !== "undefined"
      ? localStorage.getItem("selectedCatalogId")
      : null;
    const queryCatalogId = searchParams.get("catalogId");

    if (queryCatalogId) {
      setCatalogId(queryCatalogId);
    } else if (storedCatalogId) {
      setCatalogId(storedCatalogId);
    } else {
      router.push("/channel/catalog/my");
    }
  }, [searchParams, router]);

  // Função para buscar locations do backend
  const fetchLocations = useCallback(async () => {
    if (!catalogId) return;
    try {
      const fetchedLocations = await getLocationsByCatalogId(catalogId);
      setLocations(fetchedLocations);
    } catch (error) {
      setMessage("Erro ao carregar localizações. Tente novamente.");
    }
  }, [catalogId, setMessage]);

  // Efeito: buscar locations quando catalogId mudar
  useEffect(() => {
    fetchLocations();
  }, [catalogId, fetchLocations]);

  // Efeito: fechar dropdown/sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Callback: voltar para catálogos
  const handleBack = useCallback(() => {
    router.push("/channel/catalog/my");
  }, [router]);

  // Callback: buscar localização no Nominatim e salvar
  const handleSearch = useCallback(
    async (queryStr: string) => {
      if (!catalogId) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            queryStr
          )}&format=json&limit=1&polygon_geojson=1`
        );
        const data = await response.json();

        if (!data || data.length === 0) {
          setMessage("Nenhuma localização encontrada. Tente novamente.");
          return;
        }

        const { lat, lon, geojson, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        // Valida lat/long
        if (isNaN(latitude) || isNaN(longitude)) {
          setMessage("Coordenadas inválidas recebidas. Tente outra busca.");
          return;
        }

        // Monta objeto
        const newLocation: Partial<LocationData> = {
          name: display_name || queryStr,
          action,
          latitude,
          longitude,
          includedPolygons: [],
          excludedPolygons: [],
          address: {
            id: "",
            street: "",
            city: "",
            state: "",
            cep: "",
          },
        };

        // Monta bounds para centralizar
        const newPos: [number, number] = [latitude, longitude];
        const bounds: [number, number][] = [newPos];

        // Se houver polygons no geojson, adiciona
        if (geojson) {
          if (geojson.type === "Polygon") {
            const coords: [number, number][] =
              geojson.coordinates[0].map((c: [number, number]) => [c[1], c[0]]);
            bounds.push(...coords);

            if (action === "include") {
              newLocation.includedPolygons?.push(coords);
            } else {
              newLocation.excludedPolygons?.push(coords);
            }
          } else if (geojson.type === "MultiPolygon") {
            const multiCoords = geojson.coordinates.flatMap((polygon: any) =>
              polygon[0].map((c: [number, number]) => [c[1], c[0]])
            );
            bounds.push(...multiCoords);

            if (action === "include") {
              newLocation.includedPolygons?.push(multiCoords);
            } else {
              newLocation.excludedPolygons?.push(multiCoords);
            }
          }
        }

        // Salvar no backend
        await createLocation(catalogId, newLocation as LocationData);
        await fetchLocations();

        // Centralizar mapa
        if (mapRef.current) {
          if (bounds.length > 1) {
            mapRef.current.fitBounds(bounds);
          } else {
            mapRef.current.setView(newPos, 13);
          }
        }

        setSuggestions([]);
      } catch (error) {
        console.error(error);
        setMessage("Erro ao buscar a localização. Tente novamente.");
      }
    },
    [catalogId, action, fetchLocations, setMessage]
  );

  // Callback: autocomplete
  const debouncedFetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length > 2) {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              q
            )}&format=json&limit=5&addressdetails=1`
          );
          if (!resp.ok) {
            throw new Error(`HTTP error: ${resp.status}`);
          }
          const data = await resp.json();
          setSuggestions(data);
        } catch (error) {
          console.error(error);
          setMessage("Erro ao buscar sugestões. Tente novamente.");
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    [setMessage]
  );

  // Lida com mudança no input de busca
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedFetchSuggestions(val);
  };

  // Quando clica numa sugestão
  const handleSuggestionClick = useCallback(
    (sug: any) => {
      handleSearch(sug.display_name);
    },
    [handleSearch]
  );

  // Função para highlight no texto
  const highlightMatch = (text: string, q: string) => {
    const parts = text.split(new RegExp(`(${q})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className={styles.highlight}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Trocar entre Incluir/Excluir
  const handleActionChange = useCallback((newAction: "include" | "exclude") => {
    setAction(newAction);
    setDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  // Remover uma região
  const handleRemoveRegion = useCallback(
    async (index: number) => {
      const toRemove = locations[index];
      if (!toRemove?.id) return;
      try {
        await deleteLocation(toRemove.id);
        await fetchLocations();
      } catch (error) {
        console.error(error);
        setMessage("Erro ao remover a localização. Tente novamente.");
      }
    },
    [locations, fetchLocations, setMessage]
  );

  // Centralizar o mapa na região
  const handleFocusRegion = useCallback(
    (index: number) => {
      const loc = locations[index];
      if (!loc || !mapRef.current) return;

      // Checa se lat/lng são válidos
      const isLatLonValid =
        typeof loc.latitude === "number" &&
        !isNaN(loc.latitude) &&
        typeof loc.longitude === "number" &&
        !isNaN(loc.longitude);

      const bounds: [number, number][] = [];

      if (isLatLonValid) {
        bounds.push([loc.latitude, loc.longitude]);
      }

      // Adiciona polígonos se existirem
      loc.includedPolygons?.forEach((poly) => {
        if (Array.isArray(poly) && poly.length > 0) {
          bounds.push(...poly);
        }
      });
      loc.excludedPolygons?.forEach((poly) => {
        if (Array.isArray(poly) && poly.length > 0) {
          bounds.push(...poly);
        }
      });

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    },
    [locations]
  );

  // -------------------------------------------------------------------
  // 3) Depois de todos os Hooks (sem if/return interrompendo),
  //    podemos condicionar a renderização
  // -------------------------------------------------------------------

  // Se o leafletModule ainda não carregou, renderiza um loading
  if (!leafletModule) {
    return <div>Carregando o mapa...</div>;
  }
  // Agora podemos usar o Leaflet
  const L = leafletModule;

  // Cria ícones (fora dos Hooks)
  const includeIcon = new L.Icon({
    iconUrl: includeIconSrc.src ?? includeIconSrc,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const excludeIcon = new L.Icon({
    iconUrl: excludeIconSrc.src ?? excludeIconSrc,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // -------------------------------------------------------------------
  // 4) Determinar center do mapa com fallback
  // -------------------------------------------------------------------
  let mapCenter: [number, number] = [-14.235, -51.9253];
  let mapZoom = 3;
  if (locations.length > 0) {
    const lastLoc = locations[locations.length - 1];
    // Checa se lat/lng do último item são válidos
    if (
      typeof lastLoc.latitude === "number" &&
      !isNaN(lastLoc.latitude) &&
      typeof lastLoc.longitude === "number" &&
      !isNaN(lastLoc.longitude)
    ) {
      mapCenter = [lastLoc.latitude, lastLoc.longitude];
      mapZoom = 13;
    }
  }

  // -------------------------------------------------------------------
  // 5) Render final do componente
  // -------------------------------------------------------------------
  return (
    <div className={styles.visualizationPage}>
      {/* Header mobile, se for caso */}
      {typeof window !== "undefined" && window.innerWidth <= 768 && (
        <MobileHeader title="Visualização" buttons={{ close: true }} handleBack={handleBack} />
      )}

      <div className={styles.visualizationContainer}>
        <div className={styles.visualizationHeader}>
          <SubHeader title="Visualização" handleBack={handleBack} />
        </div>

        <Card title="Localizações">
          {/* Campo de busca + dropdown */}
          <div className={styles.visualizationInputGroup}>
            <div className={styles.dropdownContainer} ref={dropdownRef}>
              <div className={styles.dropdownSelected} onClick={toggleDropdown}>
                {action === "include" ? (
                  <>
                    <img
                      src={includeIconSrc.src ?? includeIconSrc}
                      alt="Include"
                      className={styles.dropdownIcon}
                    />
                    Incluir
                  </>
                ) : (
                  <>
                    <img
                      src={excludeIconSrc.src ?? excludeIconSrc}
                      alt="Exclude"
                      className={styles.dropdownIcon}
                    />
                    Excluir
                  </>
                )}
              </div>
              {dropdownOpen && (
                <div className={styles.dropdownOptions}>
                  <div
                    onClick={() => handleActionChange("include")}
                    className={styles.dropdownOption}
                  >
                    <img
                      src={includeIconSrc.src ?? includeIconSrc}
                      alt="Include"
                      className={styles.dropdownIcon}
                    />
                    Incluir
                  </div>
                  <div
                    onClick={() => handleActionChange("exclude")}
                    className={styles.dropdownOption}
                  >
                    <img
                      src={excludeIconSrc.src ?? excludeIconSrc}
                      alt="Exclude"
                      className={styles.dropdownIcon}
                    />
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
                if (e.key === "Enter") {
                  handleSearch(e.currentTarget.value);
                }
              }}
              className={styles.visualizationSearchInput}
            />
          </div>

          {/* Sugestões de autocomplete */}
          <div className={styles.suggestionsContainer} ref={suggestionsRef}>
            {suggestions.map((sug, i) => (
              <div
                key={i}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(sug)}
              >
                {highlightMatch(sug.display_name, query)}
              </div>
            ))}
          </div>

          {/* Mapa */}
          <div className={styles.visualizationMapContainer}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                OpenStreetMap</a> contributors'
              />
              <MapRefUpdater mapRef={mapRef} />

              {/* Render locations */}
              {locations.map((loc, idx) => {
                // Validar lat/lng
                const isLatLonValid =
                  typeof loc.latitude === "number" &&
                  !isNaN(loc.latitude) &&
                  typeof loc.longitude === "number" &&
                  !isNaN(loc.longitude);

                return (
                  <React.Fragment key={loc.id ?? idx}>
                    {/* Polígonos de inclusão */}
                    {loc.includedPolygons?.map((poly, i) => (
                      Array.isArray(poly) && poly.length > 0 ? (
                        <Polygon
                          key={`inc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="blue"
                        />
                      ) : null
                    ))}

                    {/* Polígonos de exclusão */}
                    {loc.excludedPolygons?.map((poly, i) => (
                      Array.isArray(poly) && poly.length > 0 ? (
                        <Polygon
                          key={`exc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="red"
                        />
                      ) : null
                    ))}

                    {/* Marker (se lat/lng válidos) */}
                    {isLatLonValid && (
                      <Marker
                        position={[loc.latitude, loc.longitude]}
                        icon={loc.action === "include" ? includeIcon : excludeIcon}
                      >
                        <Popup>{loc.name}</Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Lista de localizações adicionadas */}
          <div className={styles.visualizationSearchHistory}>
            {locations.map((loc, idx) => (
              <div
                key={loc.id ?? idx}
                className={styles.visualizationSearchItem}
                onClick={() => handleFocusRegion(idx)}
              >
                <img
                  src={
                    loc.action === "include"
                      ? includeIconSrc.src ?? includeIconSrc
                      : excludeIconSrc.src ?? excludeIconSrc
                  }
                  alt={loc.action}
                  className={styles.searchHistoryIcon}
                  style={{ marginRight: 8, width: 20, height: 20 }}
                />
                <span>{loc.name}</span>
                <button
                  className={styles.removeRegionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRegion(idx);
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

export default memo(VisualizationClient);
