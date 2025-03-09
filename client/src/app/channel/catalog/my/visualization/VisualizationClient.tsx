"use client";
export const dynamic = "force-dynamic";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  useMemo,
} from "react";
import NextDynamic from "next/dynamic"; // Renomeado para evitar conflito com a exportação "dynamic"
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { debounce } from "lodash";
import {
  createLocation,
  getLocationsByCatalogId,
  deleteLocation,
} from "@/services/catalogService";
import { LocationData } from "@/types/services/catalog";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import Card from "@/components/UI/Card/Card";
import includeIconSrc from "../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../public/assets/exclude.svg";
import styles from "./Visualization.module.css";

// Tipagem para sugestões do Nominatim
interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  geojson?: {
    type: string;
    coordinates: unknown;
  };
  [key: string]: unknown;
}

// Importação dinâmica dos componentes do react-leaflet (ssr desabilitado)
const MapContainer = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polygon = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

// Importa useMap normalmente (não usar dynamic para hooks)
import { useMap } from "react-leaflet";

// Componente auxiliar para atualizar a referência do mapa (usando o hook useMap)
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
  }, [map, mapRef]);
  return null;
}

const VisualizationClient: React.FC = () => {
  // Hooks sempre chamados
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();

  // Estados básicos
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Carregamento dinâmico do módulo do Leaflet para criação de ícones
  const [leafletModule, setLeafletModule] =
    useState<typeof import("leaflet") | null>(null);

  // Outros estados
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<"include" | "exclude">("include");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Referências
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Indica que o componente está no cliente e carrega o CSS do Leaflet
  useEffect(() => {
    setIsClient(true);
    import("leaflet/dist/leaflet.css");
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Carrega o módulo do Leaflet para criar os ícones
  useEffect(() => {
    import("leaflet").then((module) => {
      setLeafletModule(module);
    });
  }, []);

  // Obtém o catalogId a partir do localStorage ou dos query params
  useEffect(() => {
    const storedCatalogId = localStorage.getItem("selectedCatalogId");
    const queryCatalogId = searchParams.get("catalogId");

    if (queryCatalogId) {
      setCatalogId(queryCatalogId);
    } else if (storedCatalogId) {
      setCatalogId(storedCatalogId);
    } else {
      router.push("/channel/catalog/my");
    }
  }, [searchParams, router]);

  // Busca as localizações
  const fetchLocations = useCallback(async () => {
    if (!catalogId) return;
    try {
      const fetchedLocations = await getLocationsByCatalogId(catalogId);
      setLocations(fetchedLocations);
    } catch {
      setMessage("Erro ao carregar localizações. Tente novamente.");
    }
  }, [catalogId, setMessage]);

  useEffect(() => {
    fetchLocations();
  }, [catalogId, fetchLocations]);

  // Fecha dropdown e sugestões ao clicar fora
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

  // Callbacks
  const handleBack = useCallback(() => {
    router.push("/channel/catalog/my");
  }, [router]);

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

        if (isNaN(latitude) || isNaN(longitude)) {
          setMessage("Coordenadas inválidas recebidas. Tente outra busca.");
          return;
        }

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

        const newPos: [number, number] = [latitude, longitude];
        const bounds: [number, number][] = [newPos];

        if (geojson) {
          if (geojson.type === "Polygon") {
            const coords: [number, number][] = (
              (geojson.coordinates as number[][][])[0]
            ).map((c: number[]) => [c[1], c[0]]);
            bounds.push(...coords);
            if (action === "include") {
              newLocation.includedPolygons?.push(coords);
            } else {
              newLocation.excludedPolygons?.push(coords);
            }
          } else if (geojson.type === "MultiPolygon") {
            const multiCoords: [number, number][] = (
              (geojson as { type: "MultiPolygon"; coordinates: number[][][][] })
                .coordinates.flatMap(
                  (polygon: number[][][]) =>
                    polygon[0].map((c: number[]) => [c[1], c[0]] as [number, number])
                )
            );
            bounds.push(...multiCoords);
            if (action === "include") {
              newLocation.includedPolygons?.push(multiCoords);
            } else {
              newLocation.excludedPolygons?.push(multiCoords);
            }
          }
        }

        await createLocation(catalogId, newLocation as LocationData);
        await fetchLocations();

        if (mapRef.current) {
          if (bounds.length > 1) {
            mapRef.current.fitBounds(bounds);
          } else {
            mapRef.current.setView(newPos, 13);
          }
        }

        setSuggestions([]);
      } catch {
        setMessage("Erro ao buscar a localização. Tente novamente.");
      }
    },
    [catalogId, action, fetchLocations, setMessage]
  );

  const debouncedFetchSuggestions = useMemo(
    () =>
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
          } catch {
            setMessage("Erro ao buscar sugestões. Tente novamente.");
          }
        } else {
          setSuggestions([]);
        }
      }, 300),
    [setMessage]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedFetchSuggestions(val);
  };

  const handleSuggestionClick = useCallback(
    (sug: NominatimSuggestion) => {
      handleSearch(sug.display_name);
    },
    [handleSearch]
  );

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

  const handleActionChange = useCallback(
    (newAction: "include" | "exclude") => {
      setAction(newAction);
      setDropdownOpen(false);
    },
    []
  );

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleRemoveRegion = useCallback(
    async (index: number) => {
      const toRemove = locations[index];
      if (!toRemove?.id) return;
      try {
        await deleteLocation(toRemove.id);
        await fetchLocations();
      } catch {
        setMessage("Erro ao remover a localização. Tente novamente.");
      }
    },
    [locations, fetchLocations, setMessage]
  );

  const handleFocusRegion = useCallback(
    (index: number) => {
      const loc = locations[index];
      if (!loc || !mapRef.current) return;

      const bounds: [number, number][] = [];
      if (
        typeof loc.latitude === "number" &&
        !isNaN(loc.latitude) &&
        typeof loc.longitude === "number" &&
        !isNaN(loc.longitude)
      ) {
        bounds.push([loc.latitude, loc.longitude]);
      }

      loc.includedPolygons?.forEach((poly) => {
        if (Array.isArray(poly) && poly.length > 0) {
          const coords = poly.map(
            (coord) => [coord[0], coord[1]] as [number, number]
          );
          bounds.push(...coords);
        }
      });

      loc.excludedPolygons?.forEach((poly) => {
        if (Array.isArray(poly) && poly.length > 0) {
          bounds.push(...poly);
        }
      });

      if (bounds.length > 0 && mapRef.current) {
        mapRef.current.fitBounds(bounds);
      }
    },
    [locations]
  );

  // Enquanto o módulo do Leaflet não estiver carregado, mostra fallback
  if (!leafletModule) {
    return <div>Carregando o mapa...</div>;
  }
  const L = leafletModule;

  // Criação dos ícones do mapa
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

  let mapCenter: [number, number] = [-14.235, -51.9253];
  let mapZoom = 3;
  if (locations.length > 0) {
    const lastLoc = locations[locations.length - 1];
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

  // Se o componente ainda não foi montado no cliente, renderiza fallback
  if (!isClient) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.visualizationPage}>
      {isMobile && (
        <MobileHeader
          title="Visualização"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.visualizationContainer}>
        <div className={styles.visualizationHeader}>
          <SubHeader title="Visualização" handleBack={handleBack} />
        </div>

        <Card title="Localizações">
          <div className={styles.visualizationInputGroup}>
            <div className={styles.dropdownContainer} ref={dropdownRef}>
              <div className={styles.dropdownSelected} onClick={toggleDropdown}>
                {action === "include" ? (
                  <>
                    <Image
                      src={includeIconSrc.src ?? includeIconSrc}
                      alt="Include"
                      className={styles.dropdownIcon}
                      width={32}
                      height={32}
                    />
                    Incluir
                  </>
                ) : (
                  <>
                    <Image
                      src={excludeIconSrc.src ?? excludeIconSrc}
                      alt="Exclude"
                      className={styles.dropdownIcon}
                      width={32}
                      height={32}
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
                    <Image
                      src={includeIconSrc.src ?? includeIconSrc}
                      alt="Include"
                      className={styles.dropdownIcon}
                      width={32}
                      height={32}
                    />
                    Incluir
                  </div>
                  <div
                    onClick={() => handleActionChange("exclude")}
                    className={styles.dropdownOption}
                  >
                    <Image
                      src={excludeIconSrc.src ?? excludeIconSrc}
                      alt="Exclude"
                      className={styles.dropdownIcon}
                      width={32}
                      height={32}
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

          <div className={styles.visualizationMapContainer}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapRefUpdater mapRef={mapRef} />

              {locations.map((loc, idx) => {
                const isLatLonValid =
                  typeof loc.latitude === "number" &&
                  !isNaN(loc.latitude) &&
                  typeof loc.longitude === "number" &&
                  !isNaN(loc.longitude);

                return (
                  <React.Fragment key={loc.id ?? idx}>
                    {loc.includedPolygons?.map((poly, i) =>
                      Array.isArray(poly) && poly.length > 0 ? (
                        <Polygon
                          key={`inc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="blue"
                        />
                      ) : null
                    )}
                    {loc.excludedPolygons?.map((poly, i) =>
                      Array.isArray(poly) && poly.length > 0 ? (
                        <Polygon
                          key={`exc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="red"
                        />
                      ) : null
                    )}
                    {isLatLonValid && (
                      <Marker
                        position={[loc.latitude, loc.longitude]}
                        icon={
                          loc.action === "include" ? includeIcon : excludeIcon
                        }
                      >
                        <Popup>{loc.name}</Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          <div className={styles.visualizationSearchHistory}>
            {locations.map((loc, idx) => (
              <div
                key={loc.id ?? idx}
                className={styles.visualizationSearchItem}
                onClick={() => handleFocusRegion(idx)}
              >
                <Image
                  src={
                    loc.action === "include"
                      ? includeIconSrc.src ?? includeIconSrc
                      : excludeIconSrc.src ?? excludeIconSrc
                  }
                  alt="Ícone"
                  className={styles.searchHistoryIcon}
                  width={20}
                  height={20}
                  style={{ marginRight: 8 }}
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
