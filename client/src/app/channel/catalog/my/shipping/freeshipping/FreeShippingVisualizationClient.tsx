// app/channel/catalog/my/freeshipping/FreeShippingVisualizationClient.tsx
"use client";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  IMPORTS GERAIS                                                    */
/* ------------------------------------------------------------------ */
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

import {
  getLocationsByCatalogId,
  getCatalogByCatalogId,
} from "@/services/catalogService";
import { getAddressById } from "@/services/profileService";
import { LocationData } from "@/types/services/catalog";

import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import SubHeader from "@/components/Layout/SubHeader/SubHeader";
import CustomInput from "@/components/UI/CustomInput/CustomInput";
import Modal from "@/components/Modals/Modal/Modal";
import Card from "@/components/UI/Card/Card";
import StageButton from "@/components/UI/StageButton/StageButton";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";

import includeIconSrc from "../../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../../public/assets/close.svg";
import editWhiteIconSrc from "../../../../../../../public/assets/editWhite.svg";
import centerIconSrc from "../../../../../../../public/assets/buttom.svg";
import centeredIconSrc from "../../../../../../../public/assets/buttomCheio.svg";

import styles from "./FreeShipping.module.css";

/* ------------------------------------------------------------------ */
/*  TIPOS E SERVIÇOS DE FRETE GRÁTIS                                  */
/* ------------------------------------------------------------------ */
import {
  FreeShippingDTO,
  FreeShippingRadiusDTO,
  FreeShippingCoordinateDTO,
} from "@/types/services/freeshipping";

import {
  getFreeShippingByCatalogId,
  createFreeShipping,
  updateFreeShipping,
  addFreeShippingRadius,
  updateFreeShippingRadius,
  deleteFreeShippingRadius,
} from "@/services/freeshippingService";

/* ------------------------------------------------------------------ */
/*  TIPOS AUXILIARES                                                  */
/* ------------------------------------------------------------------ */
interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  geojson?: { type: string; coordinates: unknown };
}

/* ------------------------------------------------------------------ */
/*  UTILITÁRIOS DE POLÍGONO                                           */
/* ------------------------------------------------------------------ */
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

function getLargestPolygon(geojson?: {
  type: string;
  coordinates: any;
}): [number, number][] | null {
  if (!geojson?.coordinates) return null;

  if (geojson.type === "Polygon") {
    const outer = geojson.coordinates[0]?.map((c: number[]) => [c[1], c[0]]);
    return outer?.length ? outer : null;
  }

  if (geojson.type === "MultiPolygon") {
    let best: [number, number][] | null = null;
    let maxArea = 0;
    (geojson.coordinates as number[][][][]).forEach((poly) => {
      const ring = poly[0]?.map((c) => [c[1], c[0]] as [number, number]);
      const area = polygonArea(ring);
      if (area > maxArea) {
        maxArea = area;
        best = ring;
      }
    });
    return best;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  REACT‑LEAFLET DINÂMICO                                            */
/* ------------------------------------------------------------------ */
const MapContainer = NextDynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = NextDynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = NextDynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = NextDynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polygon = NextDynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false }
);
const Circle = NextDynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);

import { useMap } from "react-leaflet";
function MapRefUpdater({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    if (map && !mapRef.current) mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  GERAR POLÍGONO DE UM CÍRCULO                                      */
/* ------------------------------------------------------------------ */
const generateCircleCoordinates = (
  center: { lat: number; lng: number },
  radiusKm: number,
  points = 36
): FreeShippingCoordinateDTO[] => {
  const out: FreeShippingCoordinateDTO[] = [];
  const R = 6371;
  for (let i = 0; i < points; i++) {
    const brng = (i * 360) / points * (Math.PI / 180);
    const lat1 = center.lat * (Math.PI / 180);
    const lon1 = center.lng * (Math.PI / 180);
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(radiusKm / R) +
        Math.cos(lat1) * Math.sin(radiusKm / R) * Math.cos(brng)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(brng) * Math.sin(radiusKm / R) * Math.cos(lat1),
        Math.cos(radiusKm / R) - Math.sin(lat1) * Math.sin(lat2)
      );
    out.push({
      latitude: (lat2 * 180) / Math.PI,
      longitude: (lon2 * 180) / Math.PI,
    });
  }
  return out;
};

/* ------------------------------------------------------------------ */
/*  COMPONENTE PRINCIPAL                                              */
/* ------------------------------------------------------------------ */
const FreeShippingVisualizationClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();

  /* -------------------- UI STATE ------------------------------------ */
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leafletMod, setLeafletMod] = useState<typeof import("leaflet") | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* -------------------- DATA STATE ---------------------------------- */
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [catalogMarker, setCatalogMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [freeShipping, setFreeShipping] = useState<FreeShippingDTO | null>(null);

  /* -------------------- REFS ---------------------------------------- */
  const mapRef = useRef<L.Map | null>(null);
  const [centeredIndex, setCenteredIndex] = useState<number | null>(null);

  /* -------------------- LEAFLET ICONS ------------------------------- */
  const includeIcon = useMemo(() => {
    if (!leafletMod) return undefined;
    return new leafletMod.Icon({
      iconUrl: includeIconSrc.src,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, [leafletMod]);

  const excludeIcon = useMemo(() => {
    if (!leafletMod) return undefined;
    return new leafletMod.Icon({
      iconUrl: excludeIconSrc.src,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, [leafletMod]);

  /* -------------------- CARREGAR INFRA INICIAL ---------------------- */
  useEffect(() => {
    setIsClient(true);
    import("leaflet/dist/leaflet.css");
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    import("leaflet").then(setLeafletMod);
  }, []);

  /* -------------------- CATALOG ID ---------------------------------- */
  useEffect(() => {
    const q = searchParams.get("catalogId") ?? localStorage.getItem("selectedCatalogId");
    if (!q) router.push("/channel/catalog/my");
    else setCatalogId(q);
  }, [searchParams, router]);

  /* -------------------- BUSCAR LOCALIZAÇÕES ------------------------- */
  useEffect(() => {
    if (!catalogId) return;
    (async () => {
      try {
        setIsLoading(true);
        setLocations(await getLocationsByCatalogId(catalogId));
      } catch {
        setMessage("Erro ao carregar localizações", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [catalogId, setMessage]);

  /* -------------------- ENDEREÇO CATALOGO --------------------------- */
  const fetchLatLng = useCallback(async (address: string) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!key) return { lat: 0, lng: 0 };
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${key}`;
    const res = await fetch(url).then((r) => r.json());
    if (res.results?.length) return res.results[0].geometry.location;
    return { lat: 0, lng: 0 };
  }, []);

  useEffect(() => {
    if (!catalogId) return;
    (async () => {
      try {
        const cat = await getCatalogByCatalogId(catalogId);
        if (!cat?.addressId) return;
        const addr = await getAddressById(cat.addressId);
        const full = `${addr.street}, ${addr.city}, ${addr.state}, ${addr.cep}`;
        setCatalogMarker(await fetchLatLng(full));
      } catch {
        /* silent */
      }
    })();
  }, [catalogId, fetchLatLng]);

  /* -------------------- FREESHIPPING (FETCH / CRIA) ------------------ */
  useEffect(() => {
    if (!catalogId) return;
    (async () => {
      try {
        let fs = await getFreeShippingByCatalogId(catalogId);
        if (!fs) {
          fs = await createFreeShipping({ catalogId, active: false, radii: [] });
        }
        setFreeShipping(fs);
      } catch {
        setMessage("Erro ao carregar frete grátis", "error");
      }
    })();
  }, [catalogId, setMessage]);

  /* ------------------------------------------------------------------ */
  /*  HANDLERS PRINCIPAIS                                              */
  /* ------------------------------------------------------------------ */
  const toggleFreeShipping = async () => {
    if (!freeShipping) return;
    try {
      setIsLoading(true);
      const upd = await updateFreeShipping(freeShipping.id!, {
        ...freeShipping,
        active: !freeShipping.active,
      });
      setFreeShipping(upd);
      setMessage(`Frete grátis ${upd.active ? "ativado" : "desativado"}`);
    } catch {
      setMessage("Erro ao atualizar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------- MODAIS ------------------------------------------- */
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ km: "", minCartValue: "", average: "" });

  const onAdd = () => {
    setForm({ km: "", minCartValue: "", average: "" });
    setAddOpen(true);
  };

  const onEdit = (idx: number) => {
    if (!freeShipping) return;
    const r = freeShipping.radii[idx];
    setForm({
      km: String(r.radius),
      minCartValue: String(r.minCartValue),
      average: String(r.averageDeliveryTime),
    });
    setEditingIdx(idx);
    setEditOpen(true);
  };

  const submitAdd = async () => {
    if (!catalogMarker || !freeShipping) return;
    const km = parseFloat(form.km);
    const min = parseFloat(form.minCartValue);
    const avg = parseInt(form.average, 10);
    if (isNaN(km) || km <= 0 || isNaN(min) || min < 0 || isNaN(avg) || avg < 0) {
      setMessage("Valores inválidos", "error");
      return;
    }
    if (freeShipping.radii.some((r) => Math.abs(r.radius - km) < 1)) {
      setMessage("Raio parecido com existente", "error");
      return;
    }
    const coords = generateCircleCoordinates(catalogMarker, km);
    const newRad: FreeShippingRadiusDTO = {
      radius: km,
      minCartValue: min,
      averageDeliveryTime: avg,
      coordinates: coords,
    };
    try {
      setIsLoading(true);
      const upd = await addFreeShippingRadius(freeShipping.id!, newRad);
      setFreeShipping(upd);
      setAddOpen(false);
      setMessage("Raio adicionado");
    } catch {
      setMessage("Erro ao adicionar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const submitEdit = async () => {
    if (editingIdx === null || !freeShipping) return;
    const r = freeShipping.radii[editingIdx];
    if (!r?.id) return;
    const km = parseFloat(form.km);
    const min = parseFloat(form.minCartValue);
    const avg = parseInt(form.average, 10);
    if (isNaN(km) || km <= 0 || isNaN(min) || min < 0 || isNaN(avg) || avg < 0) {
      setMessage("Valores inválidos", "error");
      return;
    }
    const updRad: FreeShippingRadiusDTO = {
      ...r,
      radius: km,
      minCartValue: min,
      averageDeliveryTime: avg,
    };
    try {
      setIsLoading(true);
      const upd = await updateFreeShippingRadius(freeShipping.id!, r.id, updRad);
      setFreeShipping(upd);
      setEditOpen(false);
      setEditingIdx(null);
      setMessage("Raio atualizado");
    } catch {
      setMessage("Erro ao atualizar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeRadius = async (idx: number) => {
    if (!freeShipping) return;
    const r = freeShipping.radii[idx];
    if (!r?.id || !confirm("Excluir este raio?")) return;
    try {
      setIsLoading(true);
      const upd = await deleteFreeShippingRadius(freeShipping.id!, r.id);
      setFreeShipping(upd);
      setMessage("Raio removido");
    } catch {
      setMessage("Erro ao excluir", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const focusRadius = (idx: number) => {
    if (!freeShipping || !catalogMarker || !mapRef.current) return;
    const r = freeShipping.radii[idx];
    if (!r.coordinates?.length) return;
    mapRef.current.fitBounds(
      r.coordinates.map((c) => [c.latitude, c.longitude]) as [number, number][]
    );
    setCenteredIndex(idx);
  };

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
    
  /* -------------------- MAP CENTER ---------------------------------- */
  let mapCenter: [number, number] = [-14.235, -51.9253];
  let mapZoom = 3;
  if (locations.length) {
    const l = locations[locations.length - 1];
    if (!isNaN(l.latitude) && !isNaN(l.longitude)) {
      mapCenter = [l.latitude, l.longitude];
      mapZoom = 13;
    }
  } else if (catalogMarker) {
    mapCenter = [catalogMarker.lat, catalogMarker.lng];
    mapZoom = 13;
  }

  if (!isClient || !leafletMod) return <div>Carregando...</div>;

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className={styles.visualizationPage}>
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}

      {/* MOBILE HEADER */}
      {freeShipping && isMobile && (
        <MobileHeader
          title={`Frete Grátis ${freeShipping.active ? "Ativo" : "Inativo"}`}
          buttons={{ close: true, filter: true }}
          handleBack={() => router.push("/channel/catalog/my/shipping")}
          onFilter={toggleFreeShipping}
        />
      )}

      <div className={styles.visualizationContainer}>
        {/* DESKTOP HEADER */}
        {freeShipping && (
          <div className={styles.visualizationHeader}>
            <SubHeader
              title={`Frete Grátis ${freeShipping.active ? "Ativo" : "Inativo"}`}
              handleBack={() => router.push("/channel/catalog/my/shipping")}
              showActiveFilterButton
              handleActiveFilter={toggleFreeShipping}
            />
          </div>
        )}

        {/* CARD RAIOS */}
        <Card
          title="Raios"
          rightButton={{ onClick: onAdd, text: "+ Adicionar raio" }}
        >
          {freeShipping?.radii.length ? (
            <ul className={styles.DeliveryRaios}>
              {freeShipping.radii.map((r, idx) => (
                <li key={r.id ?? idx}>
                  <strong>
                    Raio: {r.radius} km&nbsp;|&nbsp;Valor mínimo: R$&nbsp;
                    {r.minCartValue.toFixed(2)}&nbsp;|&nbsp;Tempo:&nbsp;
                    {r.averageDeliveryTime}&nbsp;min
                  </strong>
                  <div className={styles.buttons}>
                    <button onClick={() => onEdit(idx)}>
                      <Image
                        src={editWhiteIconSrc}
                        width={20}
                        height={20}
                        alt="Editar"
                      />
                    </button>
                    <button onClick={() => removeRadius(idx)}>
                      <Image
                        src={excludeIconSrc}
                        width={20}
                        height={20}
                        alt="Excluir"
                      />
                    </button>
                    <button
                      onClick={() => focusRadius(idx)}
                      className={styles.centerButton}
                    >
                      <Image
                        src={centeredIndex === idx ? centerIconSrc : centeredIconSrc}
                        width={20}
                        height={20}
                        alt="Centralizar"
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum raio cadastrado</p>
          )}
        </Card>

        {/* MAPA */}
        <Card title="Localizações">
          <div className={styles.visualizationMapContainer}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "500px", width: "100%", zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
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
              
                                      {/* Círculo em torno do local (fixo 5 km) */}
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

              {/* MARCADOR CATALOGO */}
              {catalogMarker && (
                <Marker
                  position={[catalogMarker.lat, catalogMarker.lng]}
                  icon={includeIcon}
                >
                  <Popup>Endereço do Catálogo</Popup>
                </Marker>
              )}

              {/* CÍRCULOS DE FRETE GRÁTIS */}
              {catalogMarker &&
                freeShipping?.radii.map((r, i) => {
                  const color = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ffa500", "#008b8b"][
                    i % 6
                  ];
                  return (
                    <Circle
                      key={r.id ?? i}
                      center={[catalogMarker.lat, catalogMarker.lng]}
                      radius={r.radius * 1000}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}
                    >
                      <Popup>
                        Raio: {r.radius} km<br />
                        Valor mínimo: R$ {r.minCartValue.toFixed(2)}<br />
                        Tempo médio: {r.averageDeliveryTime} min
                      </Popup>
                    </Circle>
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
              </div>
            ))}
          </div>
          
        </Card>
      </div>

      {/* MODAL ADD */}
      {addOpen && (
        <Modal isOpen={addOpen} onClose={() => setAddOpen(false)}>
          <h3>Adicionar raio</h3>
          <CustomInput
            title="Raio (km)"
            value={form.km}
            onChange={(e) => setForm({ ...form, km: e.target.value })}
          />
          <CustomInput
            title="Valor mínimo (R$)"
            value={form.minCartValue}
            onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
          />
          <CustomInput
            title="Tempo médio (min)"
            value={form.average}
            onChange={(e) => setForm({ ...form, average: e.target.value })}
          />
          <div className={styles.deliveryConfirmationButtonSpace}>
            <StageButton
              text="Adicionar"
              backgroundColor="#7B33E5"
              onClick={submitAdd}
            />
          </div>
        </Modal>
      )}

      {/* MODAL EDIT */}
      {editOpen && (
        <Modal isOpen={editOpen} onClose={() => setEditOpen(false)}>
          <h3>Editar raio</h3>
          <CustomInput
            title="Raio (km)"
            value={form.km}
            onChange={(e) => setForm({ ...form, km: e.target.value })}
          />
          <CustomInput
            title="Valor mínimo (R$)"
            value={form.minCartValue}
            onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
          />
          <CustomInput
            title="Tempo médio (min)"
            value={form.average}
            onChange={(e) => setForm({ ...form, average: e.target.value })}
          />
          <div className={styles.deliveryConfirmationButtonSpace}>
            <StageButton
              text="Salvar"
              backgroundColor="#7B33E5"
              onClick={submitEdit}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default memo(FreeShippingVisualizationClient);