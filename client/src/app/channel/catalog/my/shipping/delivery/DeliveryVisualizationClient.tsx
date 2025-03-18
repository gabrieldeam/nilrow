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
import { getAddressById } from "@/services/profileService";
import { LocationData } from "@/types/services/catalog";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import Card from "@/components/UI/Card/Card";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import includeIconSrc from "../../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../../public/assets/exclude.svg";
import styles from "./Delivery.module.css";
import { DeliveryDTO, DeliveryRadiusDTO, DeliveryCoordinateDTO } from "@/types/services/delivery";

// ================ IMPORTS DO DELIVERY SERVICE ==================
import {
  getDeliveryByCatalogId,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  updateDeliveryRadii,
} from "@/services/deliveryService";

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

// Cálculo aproximado de área via Shoelace (mantém o que você já tinha)
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
// Novo import para círculos
const Circle = NextDynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

import { useMap } from "react-leaflet";
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

// Função para buscar lat/lng via Google Geocoding API (mantém o que você tinha)
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

// Função auxiliar para gerar as coordenadas de um círculo
const generateCircleCoordinates = (
  center: { lat: number; lng: number },
  radiusKm: number,
  numPoints: number = 36
): DeliveryCoordinateDTO[] => {
  const coords: DeliveryCoordinateDTO[] = [];
  const earthRadius = 6371; // Raio médio da Terra em km
  for (let i = 0; i < numPoints; i++) {
    const bearing = (i * 360) / numPoints;
    const bearingRad = (bearing * Math.PI) / 180;
    const latRad = (center.lat * Math.PI) / 180;
    const lngRad = (center.lng * Math.PI) / 180;
    const lat2 = Math.asin(
      Math.sin(latRad) * Math.cos(radiusKm / earthRadius) +
        Math.cos(latRad) * Math.sin(radiusKm / earthRadius) * Math.cos(bearingRad)
    );
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(radiusKm / earthRadius) * Math.cos(latRad),
        Math.cos(radiusKm / earthRadius) - Math.sin(latRad) * Math.sin(lat2)
      );
    coords.push({
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lng2 * 180) / Math.PI,
    });
  }
  return coords;
};

const DeliveryVisualizationClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();
  const fetchLatLng = useFetchLatLng();

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leafletModule, setLeafletModule] = useState<
    typeof import("leaflet") | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [catalogMarker, setCatalogMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<"include" | "exclude">("include");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // =============== ESTADO PARA DELIVERY ===============
  const [delivery, setDelivery] = useState<DeliveryDTO | null>(null);
  // Para definir cores aleatórias nos raios
  const colorPalette = useMemo(
    () => ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ffa500", "#008b8b"],
    []
  );

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

  // Busca as localizações salvas (código que já existia)
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

  // =============== FUNÇÃO PARA CARREGAR/CRIAR DELIVERY ===============
  const fetchOrCreateDelivery = useCallback(async () => {
    if (!catalogId) return;
    try {
      // Tenta buscar delivery existente
      let existingDelivery = await getDeliveryByCatalogId(catalogId);
      if (!existingDelivery) {
        // Se não existe, cria um "desativado" inicialmente
        const newDelivery: DeliveryDTO = {
          catalogId,
          active: false,
          radii: [],
        };
        existingDelivery = await createDelivery(newDelivery);
      }
      setDelivery(existingDelivery);
    } catch (error) {
      console.error(error);
      setMessage("Erro ao carregar/criar Delivery.");
    }
  }, [catalogId, setMessage]);

  // Carrega locations e delivery quando o catalogId mudar
  useEffect(() => {
    fetchLocations();
    fetchCatalogAddress();
    fetchOrCreateDelivery();
  }, [catalogId, fetchLocations, fetchCatalogAddress, fetchOrCreateDelivery]);

  // Fecha dropdown/sugestões ao clicar fora (código que você já tinha)
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/channel/catalog/my");
  }, [router]);

  // =================== BUSCA NO NOMINATIM (já tinha) ===================
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

  // Debounce para sugestões (código que você já tinha)
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
          bounds.push(...(poly as [number, number][]));
        }
      });

      loc.excludedPolygons?.forEach((poly) => {
        if (Array.isArray(poly) && poly.length > 0) {
          bounds.push(...(poly as [number, number][]));
        }
      });

      if (bounds.length > 0 && mapRef.current) {
        mapRef.current.fitBounds(bounds);
      }
    },
    [locations]
  );

  // ================= FUNÇÕES PARA DELIVERY =================

  // Trocar ativo/inativo
  const handleToggleDelivery = useCallback(async () => {
    if (!delivery) return;
    try {
      setIsLoading(true);
      const updated = { ...delivery, active: !delivery.active };
      let result: DeliveryDTO;
      if (updated.id) {
        result = await updateDelivery(updated.id, updated);
      } else {
        result = await createDelivery(updated);
      }
      setDelivery(result);
      setMessage(`Delivery foi ${result.active ? "ativado" : "desativado"}.`);
    } catch (error) {
      console.error(error);
      setMessage("Erro ao ativar/desativar Delivery.");
    } finally {
      setIsLoading(false);
    }
  }, [delivery, setMessage]);

  // Criar um novo raio utilizando o endpoint updateDeliveryRadii
  const handleAddRadius = useCallback(async () => {
    if (!delivery) return;

    const kmStr = prompt("Informe o raio em km:", "10");
    if (!kmStr) return;
    const km = parseFloat(kmStr);
    if (isNaN(km) || km <= 0) {
      setMessage("Raio inválido.");
      return;
    }

    const priceStr = prompt("Informe o preço para esse raio:", "15.00");
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      setMessage("Preço inválido.");
      return;
    }

    if (!catalogMarker) {
      setMessage("Endereço do catálogo não encontrado.");
      return;
    }

    // Gera as coordenadas do círculo com centro no endereço do catálogo
    const newCoordinates = generateCircleCoordinates(catalogMarker, km, 36);

    // Cria o novo objeto de raio
    const newRadius: DeliveryRadiusDTO = {
      radius: km,
      price,
      coordinates: newCoordinates,
    };

    // Junta o novo raio com os já existentes
    const updatedRadii = [...(delivery.radii || []), newRadius];

    try {
      setIsLoading(true);
      // Chama o endpoint updateDeliveryRadii passando a lista atualizada de raios
      const updatedDelivery = await updateDeliveryRadii(delivery.id!, updatedRadii);
      setDelivery(updatedDelivery);
      setMessage("Raio adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao adicionar raio.");
    } finally {
      setIsLoading(false);
    }
  }, [delivery, catalogMarker, setMessage]);

  // Editar raio
  const handleEditRadius = useCallback(
    async (index: number) => {
      if (!delivery) return;
      const radiusItem = delivery.radii[index];
      if (!radiusItem) return;

      const newKmStr = prompt(
        "Novo valor de raio (km):",
        String(radiusItem.radius)
      );
      if (!newKmStr) return;
      const newKm = parseFloat(newKmStr);
      if (isNaN(newKm) || newKm <= 0) {
        setMessage("Raio inválido.");
        return;
      }

      const newPriceStr = prompt(
        "Novo valor de preço:",
        String(radiusItem.price)
      );
      if (!newPriceStr) return;
      const newPrice = parseFloat(newPriceStr);
      if (isNaN(newPrice) || newPrice < 0) {
        setMessage("Preço inválido.");
        return;
      }

      const updatedRadii = [...delivery.radii];
      updatedRadii[index] = { ...updatedRadii[index], radius: newKm, price: newPrice };

      const updatedDelivery = { ...delivery, radii: updatedRadii };
      try {
        setIsLoading(true);
        let finalDelivery: DeliveryDTO;
        if (updatedDelivery.id) {
          finalDelivery = await updateDelivery(updatedDelivery.id, updatedDelivery);
        } else {
          finalDelivery = await createDelivery(updatedDelivery);
        }
        setDelivery(finalDelivery);
        setMessage("Raio atualizado com sucesso!");
      } catch (error) {
        console.error(error);
        setMessage("Erro ao atualizar raio.");
      } finally {
        setIsLoading(false);
      }
    },
    [delivery, setMessage]
  );

  // Excluir raio
  const handleDeleteRadius = useCallback(
    async (index: number) => {
      if (!delivery) return;
      if (!window.confirm("Deseja realmente excluir este raio?")) return;

      const updatedRadii = [...delivery.radii];
      updatedRadii.splice(index, 1);

      const updatedDelivery = { ...delivery, radii: updatedRadii };
      try {
        setIsLoading(true);
        let finalDelivery: DeliveryDTO;
        if (updatedDelivery.id) {
          finalDelivery = await updateDelivery(updatedDelivery.id, updatedDelivery);
        } else {
          finalDelivery = await createDelivery(updatedDelivery);
        }
        setDelivery(finalDelivery);
        setMessage("Raio excluído com sucesso!");
      } catch (error) {
        console.error(error);
        setMessage("Erro ao excluir raio.");
      } finally {
        setIsLoading(false);
      }
    },
    [delivery, setMessage]
  );

  // Excluir todo o Delivery (opcional)
  const handleDeleteDelivery = useCallback(async () => {
    if (!delivery || !delivery.id) {
      setMessage("Delivery não encontrado ou ainda não foi criado.");
      return;
    }
    if (!window.confirm("Deseja excluir completamente o Delivery?")) return;
    try {
      setIsLoading(true);
      await deleteDelivery(delivery.id);
      setDelivery(null);
      setMessage("Delivery excluído com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao excluir Delivery.");
    } finally {
      setIsLoading(false);
    }
  }, [delivery, setMessage]);

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

        {/* =================== NOVO CARD: CONFIGURAR DELIVERY =================== */}
        <Card title="Configurar Delivery">
          {delivery && (
            <div style={{ marginBottom: "1rem" }}>
              <p>
                Status do Delivery:{" "}
                <strong>{delivery.active ? "Ativo" : "Inativo"}</strong>
              </p>
              <button onClick={handleToggleDelivery}>
                {delivery.active ? "Desativar" : "Ativar"}
              </button>
              <button
                style={{ marginLeft: "1rem" }}
                onClick={handleDeleteDelivery}
              >
                Excluir Delivery
              </button>
            </div>
          )}

          {/* Listagem de raios */}
          {delivery && (
            <>
              <div>
                <button onClick={handleAddRadius}>Adicionar Raio</button>
              </div>
              {delivery.radii.length > 0 && (
                <ul style={{ marginTop: "1rem" }}>
                  {delivery.radii.map((r, idx) => (
                    <li key={r.id ?? idx} style={{ marginBottom: 8 }}>
                      <strong>
                        Raio: {r.radius} km | Preço: R$ {r.price.toFixed(2)}
                      </strong>{" "}
                      <button onClick={() => handleEditRadius(idx)}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteRadius(idx)}>
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Card>
        {/* =============================================================== */}

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
                    {/* Polígonos de inclusão */}
                    {loc.includedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
                        <Polygon
                          key={`inc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="green"
                        />
                      ) : null
                    )}

                    {/* Polígonos de exclusão */}
                    {loc.excludedPolygons?.map((poly, i) =>
                      poly.length > 0 ? (
                        <Polygon
                          key={`exc-${loc.id ?? idx}-${i}`}
                          positions={poly}
                          color="red"
                        />
                      ) : null
                    )}

                    {/* Marcador principal */}
                    {isLatLonValid && (
                      <>
                        <Marker
                          position={[loc.latitude, loc.longitude]}
                          icon={
                            loc.action === "include" ? includeIcon : excludeIcon
                          }
                        >
                          <Popup>{loc.name}</Popup>
                        </Marker>

                        {/* Círculo em torno do local (fixo 5 km, como antes) */}
                        <Circle
                          center={[loc.latitude, loc.longitude]}
                          radius={5000} // 5 km
                          pathOptions={{
                            color: loc.action === "include" ? "green" : "red",
                            fillColor:
                              loc.action === "include" ? "green" : "red",
                            fillOpacity: 0.2,
                          }}
                        >
                          <Popup>
                            {loc.action === "include"
                              ? "Raio de inclusão (5km)"
                              : "Raio de exclusão (5km)"}
                            <br />
                            Local: {loc.name}
                          </Popup>
                        </Circle>
                      </>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Renderiza o marcador do endereço do catálogo, se disponível */}
              {catalogMarker && (
                <Marker
                  position={[catalogMarker.lat, catalogMarker.lng]}
                  icon={includeIcon}
                >
                  <Popup>Endereço do Catálogo</Popup>
                </Marker>
              )}

              {/* =========== CÍRCULOS PARA OS RAIO(S) DO DELIVERY =========== */}
              {catalogMarker &&
                delivery?.radii?.map((r, i) => {
                  // Gera cor aleatória ou pega do array
                  const color =
                    colorPalette[i % colorPalette.length] || "#666666";
                  return (
                    <Circle
                      key={r.id ?? `radius-${i}`}
                      center={[catalogMarker.lat, catalogMarker.lng]}
                      radius={r.radius * 1000} // convertendo km -> metros
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.2,
                      }}
                    >
                      <Popup>
                        Raio: {r.radius} km <br />
                        Preço: R$ {r.price.toFixed(2)}
                      </Popup>
                    </Circle>
                  );
                })}
            </MapContainer>
          </div>

          {/* HISTÓRICO DE LOCAIS SALVOS (já existia) */}
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
