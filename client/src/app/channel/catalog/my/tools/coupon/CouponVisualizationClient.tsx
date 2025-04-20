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
import CustomSelect from "@/components/UI/CustomSelect/CustomSelect";
import Modal from "@/components/Modals/Modal/Modal";
import Card from "@/components/UI/Card/Card";
import StageButton from "@/components/UI/StageButton/StageButton";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import ProductSelectionModal from "@/components/Modals/ProductSelectionModal/ProductSelectionModal";

import includeIconSrc from "../../../../../../../public/assets/include.svg";
import excludeIconSrc from "../../../../../../../public/assets/close.svg";
import editWhiteIconSrc from "../../../../../../../public/assets/editWhite.svg";
import centerIconSrc from "../../../../../../../public/assets/buttom.svg";
import centeredIconSrc from "../../../../../../../public/assets/buttomCheio.svg";
import verificacaoIconSrc from "../../../../../../../public/assets/verificacao.svg";
import checkWhiteIconSrc from "../../../../../../../public/assets/check-white.svg";

import styles from "./FreeShipping.module.css";
  
import { debounce } from "lodash";

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

import {
  getAllCategoriesAdmin,
  getSubCategoriesByCategory
} from '@/services/categoryService';

/* ------------------------------------------------------------------ */
/*  TIPOS AUXILIARES & POLÍGONOS – (reaproveitando funções)           */
/* ------------------------------------------------------------------ */
interface NominatimSuggestion {
  place_id?: number;                    //  ← novo
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
  const [cupRule, setCupRule] = useState<'ALL'|'CATEGORY'|'SUBCATEGORY'|'PRODUCT'>('ALL');
  const [prodModalOpen, setProdModalOpen] = useState(false);
  
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCupForm(prev => ({ ...prev, code }));
  };

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryPage, setCategoryPage] = useState(0);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // ---------- REGIÕES ----------
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [picked, setPicked] = useState<NominatimSuggestion | null>(null);
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const editingRegionIdxRef = useRef<number | null>(null);

  // util: converte [lat, lon] => DTO
  const toCouponCoords = (poly: [number, number][]): CouponCoordinateDTO[] =>
    poly.map(([lat, lon]) => ({ latitude: lat, longitude: lon }));

  const handleConfirmProducts = (ids: string[]) => {
    setSelectedProductIds(ids);
    setCupForm(f => ({ ...f, productIds: ids }));
    setProdModalOpen(false);
  };


  const searchNominatim = debounce(async (text: string) => {
    if (text.length < 3) return;
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(text)}` +
      `&format=jsonv2&polygon_geojson=1&limit=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Nilrow-Coupons/1.0 (contato@nilrow.com)' },
    }).then(r => r.json());
    setSuggestions(res);
  }, 400);


  useEffect(() => {
    searchNominatim(query);
    return () => searchNominatim.cancel();
  }, [query]);
  

  // efeitos para carregar categorias iniciais
  useEffect(() => {
    async function fetchInitialCats() {
      try {
        const res = await getAllCategoriesAdmin(0, 10);
        setCategories(res.content);
        setHasMoreCategories(!res.last);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInitialCats();
  }, []);

  // função para buscar mais categorias
  const loadMoreCategories = async () => {
    const next = categoryPage + 1;
    const res = await getAllCategoriesAdmin(next, 10);
    setCategories(prev => [...prev, ...res.content]);
    setHasMoreCategories(!res.last);
    setCategoryPage(next);
  };

  // função para buscar subcategorias de uma categoria
  const fetchSubCategories = async (catId: string, page = 0) => {
    const res = await getSubCategoriesByCategory(catId, page, 10);
    if (page === 0) setSubCategories(res.content);
    else setSubCategories(prev => [...prev, ...res.content]);
    setHasMoreSubCategories(!res.last);
    setSubCategoryPage(page);
  };


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
    productIds:    [],
    categoryIds:   [],
    subCategoryIds:[],
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

  const handleRuleChange = (
    newRule: 'ALL' | 'CATEGORY' | 'SUBCATEGORY' | 'PRODUCT',
  ) => {
    setCupRule(newRule);
  
    setCupForm(prev => ({
      ...prev,
  
      /** mantém só se a regra for PRODUCT */
      productIds: newRule === 'PRODUCT' ? prev.productIds ?? [] : [],
  
      /** mantém se CATEGORY ou SUBCATEGORY */
      categoryIds:
        newRule === 'CATEGORY' || newRule === 'SUBCATEGORY'
          ? prev.categoryIds ?? []
          : [],
  
      /** mantém só se SUBCATEGORY */
      subCategoryIds:
        newRule === 'SUBCATEGORY' ? prev.subCategoryIds ?? [] : [],
    }));
  
    /* limpa a UI local */
    if (newRule !== 'PRODUCT') setSelectedProductIds([]);
    if (newRule !== 'CATEGORY' && newRule !== 'SUBCATEGORY') setCategoryId('');
    if (newRule !== 'SUBCATEGORY') setSubCategoryId('');
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

  const openEditRegion = async (idx: number) => {
    if (!selectedCoupon) return;
    const r = selectedCoupon.radii![idx];
    editingRegionIdxRef.current = idx;
    setIsEditingRegion(true);
  
    // ---- obtém nome completo da área via Nominatim reverse ----
    const lat = r.coordinates![0].latitude;
    const lon = r.coordinates![0].longitude;
    let displayName = `Região #${idx + 1}`;
    try {
      const rev = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=pt`
      ).then(res => res.json());
      if (rev?.display_name) displayName = rev.display_name;
    } catch { /* silencioso */ }
  
    // preenche campos do modal
    setQuery(displayName);
    setPicked({
      display_name: displayName,
      lat: String(lat),
      lon: String(lon),
      geojson: {
        type: 'Polygon',
        coordinates: [r.coordinates!.map(c => [c.longitude, c.latitude])],
      },
    } as any);
  
    setRegionModalOpen(true);
  };  

  
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
                      <Image
                        src={c.active ? verificacaoIconSrc : checkWhiteIconSrc}
                        width={20}
                        height={20}
                        alt={c.active ? "Desativar" : "Ativar"}
                      />
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
            rightButton={{ text: "+ Adicionar região", onClick: () => setRegionModalOpen(true) }}
          >
            {selectedCoupon.radii?.length ? (
              <ul className={styles.DeliveryRaios}>
                {selectedCoupon.radii.map((r, i) => (
                  <li key={r.id ?? i}>
                    <strong>Região #{i + 1}</strong>
                    <div className={styles.buttons}>
                    <button onClick={() => openEditRegion(i)}>
                      <Image src={editWhiteIconSrc} width={20} height={20} alt="Editar" />
                    </button>
                      <button onClick={() => removeRadius(i)}>
                        <Image src={excludeIconSrc} width={20} height={20} alt="Excluir" />
                      </button>
                      <button
                        onClick={() => {
                          const poly = r.coordinates!.map(c => [c.latitude, c.longitude]) as [number, number][];
                          if (mapRef.current) mapRef.current.fitBounds(poly);
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

              {/* polígonos das regiões do cupom selecionado */}
              {selectedCoupon?.radii?.map((r, i) => {
                const poly = r.coordinates!.map(c => [c.latitude, c.longitude]) as [number, number][];
                const color = ['#ff0000','#00ff00','#0000ff','#ff00ff','#ffa500','#008b8b'][i % 6];
                return (
                  <Polygon
                    key={r.id ?? i}
                    positions={poly}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.25 }}
                  >
                    <Popup>Região #{i + 1}</Popup>
                  </Polygon>
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

      {/* MODAL CUPOM (novo/editar) */}
      {cupModalOpen && (
      <Modal isOpen={cupModalOpen} onClose={() => setCupModalOpen(false)}>
        <h3>{isEditingCupom.current ? "Editar cupom" : "Novo cupom"}</h3>

        {/* código + gerador */}
        <div className={styles.modalRow}>
          <CustomInput
            title="Código"
            value={cupForm.code}
            onChange={e => setCupForm({ ...cupForm, code: e.target.value.toUpperCase() })}
          />
          <button
            type="button"
            className={styles.generateButton}
            onClick={generateCode}
          >
            Gerar
          </button>
        </div>

        {/* tipo de desconto */}
        <div className={styles.modalRow}>
          <label htmlFor="discountType">Tipo de desconto</label>
          <select
            id="discountType"
            value={cupForm.discountType}
            onChange={e =>
              setCupForm({ ...cupForm, discountType: e.target.value as DiscountType })
            }
          >
            <option value={DiscountType.PERCENTAGE}>Percentual</option>
            <option value={DiscountType.FIXED_AMOUNT}>Valor fixo</option>
          </select>
        </div>

        {/* valor do desconto */}
        <CustomInput
          title="Valor do desconto"
          value={String(cupForm.discountValue)}
          onChange={e => setCupForm({ ...cupForm, discountValue: e.target.value })}
          placeholder={
            cupForm.discountType === DiscountType.PERCENTAGE ? "%" : "R$"
          }
        />

        {/* limites */}
        <CustomInput
          title="Limite por usuário"
          value={String(cupForm.perUserLimit)}
          onChange={e =>
            setCupForm({ ...cupForm, perUserLimit: Number(e.target.value) })
          }
        />
        <CustomInput
          title="Limite total"
          value={String(cupForm.totalLimit)}
          onChange={e =>
            setCupForm({ ...cupForm, totalLimit: Number(e.target.value) })
          }
        />

        {/* seleção de regra de aplicação */}
        <div className={styles.modalRow}>
          <label htmlFor="cupomRule">Aplicar em</label>
          <select
            id="cupomRule"
            value={cupRule}
            onChange={e => handleRuleChange(e.target.value as typeof cupRule)}
          >
            <option value="ALL">Todos</option>
            <option value="CATEGORY">Categoria</option>
            <option value="SUBCATEGORY">Subcategoria</option>
            <option value="PRODUCT">Produtos</option>
          </select>
        </div>

        {/* se categoria */}
        {cupRule === "CATEGORY" && (
          <CustomSelect
            title="Categoria"
            value={categoryId}
            onChange={e => {
              const id = e.target.value;
            
              // estado da UI
              setCategoryId(id);
              setSubCategoryId('');
            
              // grava no DTO que vai ser salvo
              setCupForm(f => ({
                ...f,
                categoryIds: id ? [id] : [],   // array!
                subCategoryIds: [],            // zera, porque não é SUBCATEGORY
              }));
            }}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            onLoadMore={loadMoreCategories}
            hasMore={hasMoreCategories}
            bottomLeftText="Obrigatório"
          />
        )}

        {/* se subcategoria */}
        {cupRule === "SUBCATEGORY" && (
          <>
            <CustomSelect
              title="Categoria"
              value={categoryId}
              onChange={e => {
                const id = e.target.value;
              
                setCategoryId(id);
                setSubCategoryId('');
              
                setCupForm(f => ({
                  ...f,
                  categoryIds: id ? [id] : [],
                  subCategoryIds: [],    // ainda não escolheu a sub
                }));
              
                fetchSubCategories(id, 0);
              }}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              onLoadMore={loadMoreCategories}
              hasMore={hasMoreCategories}
              bottomLeftText="Obrigatório"
            />

            {categoryId && (
              <CustomSelect
                title="SubCategoria"
                value={subCategoryId}
                onChange={e => {
                  const id = e.target.value;
                
                  setSubCategoryId(id);
                
                  setCupForm(f => ({
                    ...f,
                    subCategoryIds: id ? [id] : [],
                  }));
                }}
                options={subCategories.map(s => ({ value: s.id, label: s.name }))}
                onLoadMore={() => fetchSubCategories(categoryId, subCategoryPage + 1)}
                hasMore={hasMoreSubCategories}
                bottomLeftText="Obrigatório"
              />
            )}
          </>
        )}

        {/* botão produtos permanece igual */}
        {cupRule === "PRODUCT" && (
          <>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setProdModalOpen(true)}
            >
              Selecionar produtos ({selectedProductIds.length})
            </button>
            <small>{selectedProductIds.join(", ")}</small>
          </>
        )}

        <div className={styles.modalActions}>
          <StageButton text="Salvar" backgroundColor="#7B33E5" onClick={saveCoupon} />
        </div>
      </Modal>
    )}

      {/* MODAL STUB: seleção de produtos */}
      {prodModalOpen && (
        <ProductSelectionModal
        isOpen={prodModalOpen}
        catalogId={catalogId!}
        initiallySelectedIds={selectedProductIds}
        onClose={() => setProdModalOpen(false)}
        onConfirm={handleConfirmProducts}
      />
      
      )}

      {/* MODAL REGIÃO */}
      {regionModalOpen && (
        <Modal isOpen onClose={() => {
          setRegionModalOpen(false);
          setQuery('');
          setSuggestions([]);
          setPicked(null);
          setIsEditingRegion(false);
          editingRegionIdxRef.current = null;
        }}>
          <h4>{isEditingRegion ? "Editar região" : "Adicionar região"} para {selectedCoupon?.code}</h4>
          <CustomInput
            title="Buscar bairro/cidade"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPicked(null);
            }}
            placeholder="Ex.: Vila Mariana São Paulo"
          />

          {/* sugestões */}
          <ul className={styles.suggestionList}>
            {suggestions.map(s => (
              <li
                key={s.place_id}
                onClick={() => {
                  setPicked(s);
                  setQuery(s.display_name);
                  setSuggestions([]);
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>          

          {picked && (
            <StageButton
              text={isEditingRegion ? "Salvar" : "Adicionar"}
              backgroundColor="#7B33E5"
              onClick={async () => {
                if (!selectedCoupon || !picked) return;
                const poly = getLargestPolygon(picked.geojson);
                if (!poly) return setMessage('Região sem polígono', 'error');

                const dto: CouponRadiusDTO = {
                  radius: 0, // agora irrelevante
                  coordinates: toCouponCoords(poly),
                };

                try {
                  setIsLoading(true);
                  const upd = isEditingRegion
                  ? await updateCouponRadius(
                      selectedCoupon.id!,
                      selectedCoupon.radii![editingRegionIdxRef.current!].id!,
                      { ...dto, id: selectedCoupon.radii![editingRegionIdxRef.current!].id }
                    )
                  : await addCouponRadius(selectedCoupon.id!, dto);
                  setCoupons(arr => {
                    const clone = [...arr];
                    clone[selectedIdx!] = upd;
                    return clone;
                  });
                  setRegionModalOpen(false);
                  setMessage('Região adicionada');
                } catch {
                  setMessage('Erro ao adicionar', 'error');
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          )}
        </Modal>
      )}


      
    </div>
  );
};

export default memo(CouponVisualizationClient);