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
  getLocationsByCatalogId,
  getCatalogByCatalogId,
} from "@/services/catalogService";
import { getAddressById } from '@/services/profileService';
import { LocationData } from "@/types/services/catalog";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import Card from "@/components/UI/Card/Card";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import includeIconSrc from "../../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../../public/assets/exclude.svg";
import styles from "./Delivery.module.css";

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
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const x_i = coords[i][1];
    const y_i = coords[i][0];
    const x_j = coords[j][1];
    const y_j = coords[j][0];
    area += x_i * y_j - x_j * y_i;
  }
  return Math.abs(area) / 2;
}

/**
 * Retorna o anel externo de maior área a partir do geojson.
 */
function getLargestPolygon(
  geojson: { type: string; coordinates: any }
): [number, number][] | null {
  if (!geojson?.coordinates) return null;

  if (geojson.type === "Polygon") {
    const outerRing = geojson.coordinates[0]?.map((c: number[]) => [c[1], c[0]]);
    return outerRing && outerRing.length ? outerRing : null;
  }

  if (geojson.type === "MultiPolygon") {
    const multiCoords = geojson.coordinates as number[][][][];

    let maxArea = 0;
    let bestRing: [number, number][] | null = null;

    multiCoords.forEach((polygonCoords) => {
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

// Função para buscar lat/lng via Google Geocoding API
const useFetchLatLng = () => {
  return useCallback(async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!API_KEY) {
        console.error("Google API key não foi encontrada no .env");
        return { lat: 0, lng: 0 };
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log("Dados do Google Geocoding para o endereço:", address, data);

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.error("Nenhum resultado encontrado para o endereço:", address);
        return { lat: 0, lng: 0 };
      }
    } catch (error) {
      console.error("Erro ao buscar latitude/longitude:", error);
      return { lat: 0, lng: 0 };
    }
  }, []);
};

const DeliveryVisualizationClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();
  const fetchLatLng = useFetchLatLng();

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leafletModule, setLeafletModule] = useState<typeof import("leaflet") | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [catalogMarker, setCatalogMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<"include" | "exclude">("include");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Carrega Leaflet (client-side) + detecta mobile
  useEffect(() => {
    setIsClient(true);
    import("leaflet/dist/leaflet.css");
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Carrega o módulo leaflet dinamicamente
  useEffect(() => {
    import("leaflet").then((module) => setLeafletModule(module));
  }, []);

  // Pega o catalogId via searchParams ou localStorage
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

  // Busca as localizações salvas
  const fetchLocations = useCallback(async () => {
    if (!catalogId) return;
    setIsLoading(true);
    try {
      const fetchedLocations = await getLocationsByCatalogId(catalogId);
      setLocations(fetchedLocations);
    } catch {
      setMessage("Erro ao carregar localizações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [catalogId, setMessage]);

  // Busca os dados do catálogo e o endereço associado para obter as coordenadas
  const fetchCatalogAddress = useCallback(async () => {
    if (!catalogId) return;
    try {
      const catalog = await getCatalogByCatalogId(catalogId);
      // Supondo que o catálogo retorne o id do endereço como "addressId"
      const addressId = catalog.addressId;
      if (!addressId) {
        console.error("Endereço não encontrado no catálogo");
        return;
      }
      const addressData = await getAddressById(addressId);
      // Formata o endereço conforme os dados retornados (ajuste conforme o seu DTO)
      const fullAddress = `${addressData.street}, ${addressData.city}, ${addressData.state}, ${addressData.cep}`;
      const { lat, lng } = await fetchLatLng(fullAddress);
      setCatalogMarker({ lat, lng });
    } catch (error) {
      console.error("Erro ao buscar catálogo ou endereço:", error);
    }
  }, [catalogId, fetchLatLng]);

  useEffect(() => {
    fetchLocations();
  }, [catalogId, fetchLocations]);

  useEffect(() => {
    fetchCatalogAddress();
  }, [catalogId, fetchCatalogAddress]);

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

  // Busca no Nominatim e salva (exemplo para futura funcionalidade)
  const handleSearch = useCallback(
    async (queryStr: string) => {
      if (!catalogId) return;
      setIsLoading(true);
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

        if (geojson?.type) {
          const biggestRing = getLargestPolygon(geojson);
          if (biggestRing && biggestRing.length) {
            if (action === "include") {
              newLocation.includedPolygons?.push(biggestRing);
            } else {
              newLocation.excludedPolygons?.push(biggestRing);
            }
            bounds.push(...biggestRing);
          }
        }

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
      } finally {
        setIsLoading(false);
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

  // Define o centro do mapa: se houver locais, usa o último; se houver marcador do catálogo, pode ser utilizado
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
  } else if (catalogMarker) {
    mapCenter = [catalogMarker.lat, catalogMarker.lng];
    mapZoom = 13;
  }

  if (!isClient) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.visualizationPage}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}

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

              {/* Renderiza os marcadores das localizações cadastradas */}
              {locations.map((loc, idx) => {
                const isLatLonValid =
                  typeof loc.latitude === "number" &&
                  !isNaN(loc.latitude) &&
                  typeof loc.longitude === "number" &&
                  !isNaN(loc.longitude);

                return (
                  <React.Fragment key={loc.id ?? idx}>
                    {loc.includedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
                        <Polygon
                          key={`inc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="green"
                        />
                      ) : null
                    )}

                    {loc.excludedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
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

              {/* Renderiza o marcador do endereço do catálogo, se disponível */}
              {catalogMarker && (
                <Marker position={[catalogMarker.lat, catalogMarker.lng]} icon={includeIcon}>
                  <Popup>Endereço do Catálogo</Popup>
                </Marker>
              )}
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
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default memo(DeliveryVisualizationClient);
