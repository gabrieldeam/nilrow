// app/channel/catalog/my/coupons/CouponVisualizationClient.tsx
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
/*  TIPOS E SERVIÇOS DE CUPONS                                        */
/* ------------------------------------------------------------------ */
import {
  CouponDTO,
  CouponRadiusDTO,
  CouponCoordinateDTO,
  DiscountType,
} from "@/types/services/coupon";

import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  addCouponRadius,
  updateCouponRadius,
  deleteCouponRadius,
  getAllCoupons,
  checkCoupon,
} from "@/services/couponService";

/* ------------------------------------------------------------------ */
/*  TIPOS AUXILIARES & POLÍGONOS – (reaproveitando funções)           */
/* ------------------------------------------------------------------ */
interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  geojson?: { type: string; coordinates: unknown };
}

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
/*  REACT‑LEAFLET (dinâmico)                                          */
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
/*  HELPER PARA GERAR CÍRCULO                                         */
/* ------------------------------------------------------------------ */
const generateCircleCoordinates = (
  center: { lat: number; lng: number },
  radiusKm: number,
  points = 36
): CouponCoordinateDTO[] => {
  const out: CouponCoordinateDTO[] = [];
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
const CouponVisualizationClient: React.FC = () => {
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

  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); // cupom em foco

  /* -------------------- REFS ---------------------------------------- */
  const mapRef = useRef<L.Map | null>(null);
  const [centeredIdx, setCenteredIdx] = useState<number | null>(null);

  /* -------------------- ICONES MAPA --------------------------------- */
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

  /* -------------------- CARREGAR CUPONS ----------------------------- */
  useEffect(() => {
    if (!catalogId) return;
    (async () => {
      try {
        setIsLoading(true);
        const list = await getAllCoupons(); // back já deve filtrar por catálogo logado
        setCoupons(list.filter((c) => c.catalogId === catalogId));
      } catch {
        setMessage("Erro ao buscar cupons", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [catalogId, setMessage]);

  /* ------------------------------------------------------------------ */
  /*  HANDLERS CUPOM                                                   */
  /* ------------------------------------------------------------------ */
  const toggleCoupon = async (idx: number) => {
    const cup = coupons[idx];
    if (!cup.id) return;
    try {
      setIsLoading(true);
      const upd = await updateCoupon(cup.id, { ...cup, active: !cup.active });
      setCoupons((arr) => {
        const clone = [...arr];
        clone[idx] = upd;
        return clone;
      });
      setMessage(`Cupom ${upd.code} ${upd.active ? "ativado" : "desativado"}`);
    } catch {
      setMessage("Erro ao atualizar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async (idx: number) => {
    const cup = coupons[idx];
    if (!cup.id || !confirm("Excluir este cupom?")) return;
    try {
      setIsLoading(true);
      await deleteCoupon(cup.id);
      setCoupons((arr) => arr.filter((_, i) => i !== idx));
      if (selectedIdx === idx) setSelectedIdx(null);
      setMessage("Cupom excluído");
    } catch {
      setMessage("Erro ao excluir", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------- FORMULÁRIO NOVO/EDIT ----------------------------- */
  const blankCoupon: CouponDTO = {
    code: "",
    catalogId: catalogId ?? "",
    active: false,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    perUserLimit: 1,
    totalLimit: 100,
    radii: [],
  };

  const [cupModalOpen, setCupModalOpen] = useState(false);
  const [cupForm, setCupForm] = useState<CouponDTO>(blankCoupon);
  const isEditingCupom = useRef(false);
  const editingIndexRef = useRef<number | null>(null);

  const openAddCoupon = () => {
    setCupForm({ ...blankCoupon, catalogId: catalogId ?? "" });
    isEditingCupom.current = false;
    setCupModalOpen(true);
  };

  const openEditCoupon = (idx: number) => {
    setCupForm(coupons[idx]);
    isEditingCupom.current = true;
    editingIndexRef.current = idx;
    setCupModalOpen(true);
  };

  const saveCoupon = async () => {
    if (!cupForm.code.trim()) {
      setMessage("Código obrigatório", "error");
      return;
    }
    try {
      setIsLoading(true);
      let saved: CouponDTO;
      if (isEditingCupom.current && cupForm.id) {
        saved = await updateCoupon(cupForm.id, cupForm);
        setCoupons((arr) => {
          const clone = [...arr];
          clone[editingIndexRef.current!] = saved;
          return clone;
        });
      } else {
        saved = await createCoupon(cupForm);
        setCoupons((arr) => [...arr, saved]);
      }
      setCupModalOpen(false);
      setMessage("Cupom salvo");
    } catch {
      setMessage("Erro ao salvar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------- RADII DO CUPOM SELECIONADO ----------------------- */
  const selectedCoupon = selectedIdx !== null ? coupons[selectedIdx] : null;

  const [radModalOpen, setRadModalOpen] = useState(false);
  const [radForm, setRadForm] = useState({ km: "", });

  const openAddRadius = () => {
    setRadForm({ km: "" });
    setRadModalOpen(true);
  };

  const submitAddRadius = async () => {
    if (!selectedCoupon || !catalogMarker) return;
    const km = parseFloat(radForm.km);
    if (isNaN(km) || km <= 0) {
      setMessage("Raio inválido", "error");
      return;
    }
    const coords = generateCircleCoordinates(catalogMarker, km);
    const radiusDTO: CouponRadiusDTO = { radius: km, coordinates: coords };
    try {
      setIsLoading(true);
      const upd = await addCouponRadius(selectedCoupon.id!, radiusDTO);
      setCoupons((arr) => {
        const clone = [...arr];
        clone[selectedIdx!] = upd;
        return clone;
      });
      setRadModalOpen(false);
      setMessage("Raio adicionado");
    } catch {
      setMessage("Erro ao adicionar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const removeRadius = async (radIdx: number) => {
    if (!selectedCoupon) return;
    const r = selectedCoupon.radii?.[radIdx];
    if (!r?.id || !confirm("Excluir este raio?")) return;
    try {
      setIsLoading(true);
      const upd = await deleteCouponRadius(selectedCoupon.id!, r.id);
      setCoupons((arr) => {
        const clone = [...arr];
        clone[selectedIdx!] = upd;
        return clone;
      });
      setMessage("Raio removido");
    } catch {
      setMessage("Erro ao excluir", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}

      {/* MOBILE HEADER */} 
      {isMobile && (
        <MobileHeader
          title="Cupons"
          buttons={{ close: true, filter: false }}
          handleBack={() => router.push("/channel/catalog/my")}
        />
      )}

      <div className={styles.visualizationContainer}>
        <div className={styles.visualizationHeader}>
          <SubHeader
            title="Cupons"
            handleBack={() => router.push("/channel/catalog/my")}            
          />
        </div>

        {/* LISTA DE CUPONS */}
        <Card title="Lista de cupons" rightButton={{ text: "+ Novo cupom", onClick: openAddCoupon }}>
          {coupons.length ? (
            <ul className={styles.DeliveryRaios}>
              {coupons.map((c, idx) => (
                <li key={c.id ?? idx}>
                  <strong>
                    {c.code} –{" "}
                    {c.discountType === DiscountType.PERCENTAGE
                      ? `${c.discountValue}%`
                      : `R$ ${Number(c.discountValue).toFixed(2)}`}
                    &nbsp;|&nbsp;
                    {c.active ? "Ativo" : "Inativo"}
                  </strong>

                  <div className={styles.buttons}>
                    <button onClick={() => toggleCoupon(idx)}>
                      {c.active ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => openEditCoupon(idx)}>
                      <Image src={editWhiteIconSrc} width={20} height={20} alt="Editar" />
                    </button>
                    <button onClick={() => removeCoupon(idx)}>
                      <Image src={excludeIconSrc} width={20} height={20} alt="Excluir" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedIdx(selectedIdx === idx ? null : idx)
                      }
                      className={styles.centerButton}
                    >
                      <Image
                        src={selectedIdx === idx ? centeredIconSrc : centerIconSrc}
                        width={20}
                        height={20}
                        alt="Detalhes"
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum cupom cadastrado</p>
          )}
        </Card>

        {/* DETALHES DE RAIOS DO CUPOM SELECIONADO */}
        {selectedCoupon && (
          <Card
            title={`Raios do cupom ${selectedCoupon.code}`}
            rightButton={{ text: "+ Adicionar raio", onClick: openAddRadius }}
          >
            {selectedCoupon.radii?.length ? (
              <ul className={styles.DeliveryRaios}>
                {selectedCoupon.radii.map((r, i) => (
                  <li key={r.id ?? i}>
                    <strong>Raio: {r.radius} km</strong>
                    <div className={styles.buttons}>
                      <button onClick={() => removeRadius(i)}>
                        <Image src={excludeIconSrc} width={20} height={20} alt="Excluir" />
                      </button>
                      <button
                        onClick={() => {
                          if (!mapRef.current || !catalogMarker) return;
                          mapRef.current.fitBounds(
                            generateCircleCoordinates(catalogMarker, r.radius).map((c) => [
                              c.latitude,
                              c.longitude,
                            ]) as [number, number][]
                          );
                        }}
                        className={styles.centerButton}
                      >
                        <Image
                          src={centerIconSrc}
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
              <p>Nenhum raio para este cupom</p>
            )}
          </Card>
        )}

        {/* MAPA */}
        <Card title="Visualização no mapa">
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

              {/* Polígonos e marcadores de Locations (mesmo que FreeShipping) */}
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
                        icon={loc.action === "include" ? includeIcon : excludeIcon}
                      >
                        <Popup>{loc.name}</Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}

              {/* marcador do catálogo */}
              {catalogMarker && (
                <Marker position={[catalogMarker.lat, catalogMarker.lng]} icon={includeIcon}>
                  <Popup>Endereço do Catálogo</Popup>
                </Marker>
              )}

              {/* círculos dos raios do cupom selecionado */}
              {catalogMarker &&
                selectedCoupon?.radii?.map((r, i) => {
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
                      <Popup>Raio: {r.radius} km</Popup>
                    </Circle>
                  );
                })}
            </MapContainer>
          </div>
        </Card>
      </div>

      {/* MODAL CUPOM (novo/editar) */}
      {cupModalOpen && (
        <Modal isOpen={cupModalOpen} onClose={() => setCupModalOpen(false)}>
          <h3>{isEditingCupom.current ? "Editar cupom" : "Novo cupom"}</h3>

          <CustomInput
            title="Código"
            value={cupForm.code}
            onChange={(e) => setCupForm({ ...cupForm, code: e.target.value.toUpperCase() })}
          />
          <CustomInput
            title="Valor do desconto"
            value={String(cupForm.discountValue)}
            onChange={(e) => setCupForm({ ...cupForm, discountValue: e.target.value })}
            placeholder={cupForm.discountType === DiscountType.PERCENTAGE ? "%" : "R$"}
          />
          <CustomInput
            title="Limite por usuário"
            value={String(cupForm.perUserLimit)}
            onChange={(e) => setCupForm({ ...cupForm, perUserLimit: Number(e.target.value) })}
          />
          <CustomInput
            title="Limite total"
            value={String(cupForm.totalLimit)}
            onChange={(e) => setCupForm({ ...cupForm, totalLimit: Number(e.target.value) })}
          />

          <StageButton
            text="Salvar"
            backgroundColor="#7B33E5"
            onClick={saveCoupon}
          />
        </Modal>
      )}

      {/* MODAL RADIUS */}
      {radModalOpen && (
        <Modal isOpen={radModalOpen} onClose={() => setRadModalOpen(false)}>
          <h3>Novo raio para {selectedCoupon?.code}</h3>
          <CustomInput
            title="Raio (km)"
            value={radForm.km}
            onChange={(e) => setRadForm({ km: e.target.value })}
          />

          <StageButton
            text="Adicionar"
            backgroundColor="#7B33E5"
            onClick={submitAddRadius}
          />
        </Modal>
      )}
    </div>
  );
};

export default memo(CouponVisualizationClient);