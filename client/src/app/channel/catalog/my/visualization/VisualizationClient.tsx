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
import NextDynamic from "next/dynamic";
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

// Tipagem do Nominatim
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

// Cálculo aproximado de área via Shoelace
function polygonArea(coords: [number, number][]): number {
  // coords: array de [lat, lon]
  // Shoelace formula (em "graus", não metros):
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    // lat -> x, lon -> y (ou vice-versa, mas consistente)
    const x_i = coords[i][1];
    const y_i = coords[i][0];
    const x_j = coords[j][1];
    const y_j = coords[j][0];
    area += x_i * y_j - x_j * y_i;
  }
  return Math.abs(area) / 2;
}

/**
 * Recebe o objeto geojson do Nominatim (Polygon ou MultiPolygon)
 * e retorna apenas o anel externo de maior área.
 */
function getLargestPolygon(
  geojson: { type: string; coordinates: any }
): [number, number][] | null {
  if (!geojson?.coordinates) return null;

  // Caso seja Polygon
  if (geojson.type === "Polygon") {
    // Normalmente, coordinates = [ [ [lng, lat], [lng, lat], ... ] ]
    // outer ring: geojson.coordinates[0]
    // ignoramos furos (geojson.coordinates[1..n]) se existirem
    const outerRing = geojson.coordinates[0]?.map((c: number[]) => [c[1], c[0]]);
    return outerRing && outerRing.length ? outerRing : null;
  }

  // Caso seja MultiPolygon
  if (geojson.type === "MultiPolygon") {
    // É um array de polígonos => coordinates = [ polygon1, polygon2, ...]
    // Cada polygonN é algo como [ [ [lng, lat], [lng, lat], ... ] , [hole1] ... ]
    // ou seja, polygonN[0] é o anel externo, polygonN[1..n] são furos
    const multiCoords = geojson.coordinates as number[][][][];
    let maxArea = 0;
    let bestRing: [number, number][] | null = null;

    multiCoords.forEach((polygonCoords) => {
      // polygonCoords[0] = outer ring
      if (polygonCoords[0] && polygonCoords[0].length > 0) {
        const ring = polygonCoords[0].map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );
        const area = polygonArea(ring);
        if (area > maxArea) {
          maxArea = area;
          bestRing = ring;
        }
      }
    });

    return bestRing;
  }

  return null;
}

// ------------------ React-Leaflet (import dinâmico) ------------------
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

import { useMap } from "react-leaflet";
function MapRefUpdater({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  return null;
}

const VisualizationClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<"include" | "exclude">("include");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Carrega Leaflet (Client side) + detecta mobile
  useEffect(() => {
    setIsClient(true);
    import("leaflet/dist/leaflet.css");
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Carrega o módulo leaflet dinamicamente
  useEffect(() => {
    import("leaflet").then((module) => setLeafletModule(module));
  }, []);

  // Pega o catalogId via searchParam ou localStorage
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

  // Carrega as localizações salvas
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

  // Fecha dropdown/sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/channel/catalog/my");
  }, [router]);

  // Principal: busca no Nominatim e salva
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

        // Monta a localização
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

        // Sempre adicionamos a pos principal nos bounds
        const newPos: [number, number] = [latitude, longitude];
        const bounds: [number, number][] = [newPos];

        // Se tiver geometria
        if (geojson?.type) {
          // Seleciona o maior polígono (ou null)
          const biggestRing = getLargestPolygon(geojson);
          if (biggestRing && biggestRing.length) {
            // Se for include, joga em includedPolygons; se exclude, em excludedPolygons
            if (action === "include") {
              newLocation.includedPolygons?.push(biggestRing);
            } else {
              newLocation.excludedPolygons?.push(biggestRing);
            }
            bounds.push(...biggestRing);
          }
        }

        // Cria no banco
        await createLocation(catalogId, newLocation as LocationData);
        // Recarrega
        await fetchLocations();

        // Ajusta zoom
        if (mapRef.current) {
          if (bounds.length > 1) {
            mapRef.current.fitBounds(bounds);
          } else {
            mapRef.current.setView(newPos, 13);
          }
        }

        // Limpa sugestões
        setSuggestions([]);
      } catch {
        setMessage("Erro ao buscar a localização. Tente novamente.");
      }
    },
    [catalogId, action, fetchLocations, setMessage]
  );

  // Debounce para sugestões
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
      setQuery(sug.display_name);
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

  const handleActionChange = useCallback((newAction: "include" | "exclude") => {
    setAction(newAction);
    setDropdownOpen(false);
  }, []);

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
          bounds.push(...poly);
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

  if (!leafletModule) {
    return <div>Carregando o mapa...</div>;
  }
  const L = leafletModule;

  // Ícones
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

  // Centro inicial no Brasil
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

  // Enquanto SSR
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
            {/* BOTÃO DROPDOWN */}
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
                <div className={`${styles.dropdownOptions} ${styles.dropdownOpen}`}>
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

            {/* INPUT DE PESQUISA */}
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

          {/* SUGESTÕES */}
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

          {/* MAPA */}
          <div className={styles.visualizationMapContainer}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "500px", width: "100%", zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapRefUpdater mapRef={mapRef} />

              {/* Marcadores e polígonos */}
              {locations.map((loc, idx) => {
                const isLatLonValid =
                  typeof loc.latitude === "number" &&
                  !isNaN(loc.latitude) &&
                  typeof loc.longitude === "number" &&
                  !isNaN(loc.longitude);

                return (
                  <React.Fragment key={loc.id ?? idx}>
                    {/* Polígonos de INCLUSÃO (verde) */}
                    {loc.includedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
                        <Polygon
                          key={`inc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="green"
                        />
                      ) : null
                    )}

                    {/* Polígonos de EXCLUSÃO (vermelho) */}
                    {loc.excludedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
                        <Polygon
                          key={`exc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="red"
                        />
                      ) : null
                    )}

                    {/* Marcador principal (coordenadas) */}
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

          {/* HISTÓRICO DE LOCAIS SALVOS */}
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
