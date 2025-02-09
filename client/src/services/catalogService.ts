import api from './api';
import { 
    CatalogDTO, 
    CatalogData, 
    LocationData 
} from '../types/services/catalog';

// Criação de catálogo
export const createCatalog = async (catalogDTO: CatalogDTO) => {
    const response = await api.post<CatalogData>('/catalog/create', catalogDTO);
    return response.data;
};

// Busca catálogos visíveis
export const getVisibleCatalogs = async () => {
    const response = await api.get<CatalogData[]>('/catalog/visible');
    return response.data;
};

// Busca catálogos ocultos
export const getHiddenCatalogs = async () => {
    const response = await api.get<CatalogData[]>('/catalog/hidden');
    return response.data;
};

// Busca catálogo por ID
export const getCatalogByCatalogId = async (catalogId: string) => {
    const response = await api.get<CatalogData>(`/catalog/${catalogId}`);
    return response.data;
};

// Atualiza um catálogo
export const editCatalog = async (id: string, catalogDTO: CatalogDTO) => {
    const response = await api.put<CatalogData>(`/catalog/edit/${id}`, catalogDTO);
    return response.data;
};

// Deleta um catálogo
export const deleteCatalog = async (id: string) => {
    await api.delete(`/catalog/delete/${id}`);
};

// Atualiza a liberação do catálogo
export const updateCatalogRelease = async (id: string, released: boolean) => {
    await api.patch(`/catalog/release/${id}`, null, {
        params: { released }
    });
};

// Verifica se o catálogo está liberado
export const isCatalogReleased = async (id: string) => {
    const response = await api.get<boolean>(`/catalog/${id}/is-released`);
    return response.data;
};

// Atualiza a visibilidade do catálogo
export const updateCatalogVisibility = async (id: string, visible: boolean) => {
    await api.patch(`/catalog/visibility/${id}`, null, {
        params: { visible }
    });
};

// Verifica se o catálogo está visível
export const isCatalogVisible = async (id: string) => {
    const response = await api.get<boolean>(`/catalog/${id}/is-visible`);
    return response.data;
};

// Busca detalhes de um local usando Google Places via backend
export const fetchPlaceDetails = async (placeId: string) => {
    const response = await api.get(`/google/google-place-details`, {
        params: { placeId }
    });
    return response.data;
};

// Criação de uma localização
export const createLocation = async (catalogId: string, locationDTO: LocationData) => {
    const response = await api.post(`/locations/create/${catalogId}`, locationDTO);
    return response.data;
};

// Deleta uma localização
export const deleteLocation = async (locationId: string) => {
    await api.delete(`/locations/delete/${locationId}`);
};

// Busca localizações por ID do catálogo
export const getLocationsByCatalogId = async (catalogId: string) => {
    const response = await api.get<LocationData[]>(`/locations/catalog/${catalogId}`);
    return response.data;
};

export default api;
