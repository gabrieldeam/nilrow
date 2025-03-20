package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.shipping.delivery.*;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.DeliveryRepository;
import marketplace.nilrow.util.PolygonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    @Override
    public DeliveryDTO createDelivery(DeliveryDTO deliveryDTO) {
        Delivery delivery = mapToEntity(deliveryDTO);
        Delivery savedDelivery = deliveryRepository.save(delivery);
        return mapToDTO(savedDelivery);
    }

    @Override
    public DeliveryDTO updateDelivery(String id, DeliveryDTO deliveryDTO) {
        Delivery existingDelivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));

        // Atualize os campos necessários. Exemplo:
        existingDelivery.setActive(deliveryDTO.isActive());
        // Se necessário, atualizar os "radii" e demais propriedades

        Delivery updatedDelivery = deliveryRepository.save(existingDelivery);
        return mapToDTO(updatedDelivery);
    }

    @Transactional
    @Override
    public DeliveryDTO addDeliveryRadius(String deliveryId, DeliveryRadiusDTO radiusDTO) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));
        if (delivery.getRadii() == null) {
            delivery.setRadii(new ArrayList<>());
        }

        DeliveryRadius radius = new DeliveryRadius();
        radius.setDelivery(delivery);
        radius.setRadius(radiusDTO.getRadius());
        radius.setPrice(radiusDTO.getPrice());
        // Novo campo: define o tempo médio de entrega
        radius.setAverageDeliveryTime(radiusDTO.getAverageDeliveryTime());
        radius.setCoordinates(updateCoordinates(radius, radiusDTO.getCoordinates()));

        delivery.getRadii().add(radius);
        Delivery saved = deliveryRepository.save(delivery);
        return mapToDTO(saved);
    }

    @Transactional
    @Override
    public DeliveryDTO updateDeliveryRadius(String deliveryId, DeliveryRadiusDTO radiusDTO) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));

        DeliveryRadius radius = delivery.getRadii().stream()
                .filter(r -> r.getId().equals(radiusDTO.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Raio de delivery não encontrado"));

        // Atualiza os campos básicos do raio
        radius.setRadius(radiusDTO.getRadius());
        radius.setPrice(radiusDTO.getPrice());
        // Atualiza o novo campo: tempo médio de entrega
        radius.setAverageDeliveryTime(radiusDTO.getAverageDeliveryTime());

        // Atualiza as coordenadas mantendo a mesma referência da coleção
        List<DeliveryCoordinate> newCoords = updateCoordinates(radius, radiusDTO.getCoordinates());
        if (radius.getCoordinates() != null) {
            radius.getCoordinates().clear();
            radius.getCoordinates().addAll(newCoords);
        } else {
            radius.setCoordinates(newCoords);
        }

        Delivery saved = deliveryRepository.save(delivery);
        return mapToDTO(saved);
    }

    @Transactional
    @Override
    public DeliveryDTO deleteDeliveryRadius(String deliveryId, String radiusId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));

        boolean removed = delivery.getRadii().removeIf(r -> r.getId().equals(radiusId));
        if (!removed) {
            throw new RuntimeException("Raio de delivery não encontrado");
        }

        Delivery saved = deliveryRepository.save(delivery);
        return mapToDTO(saved);
    }

    /**
     * Método auxiliar para atualizar coordenadas (mantendo a referência da coleção)
     */
    private List<DeliveryCoordinate> updateCoordinates(DeliveryRadius radiusEntity, List<DeliveryCoordinateDTO> coordDTOs) {
        List<DeliveryCoordinate> coords = new ArrayList<>();
        if (coordDTOs != null) {
            for (DeliveryCoordinateDTO dto : coordDTOs) {
                DeliveryCoordinate coord = new DeliveryCoordinate();
                coord.setDeliveryRadius(radiusEntity);
                coord.setLatitude(dto.getLatitude());
                coord.setLongitude(dto.getLongitude());
                coords.add(coord);
            }
        }
        return coords;
    }

    /**
     * Método para obter o preço do delivery com base em um ponto (lat, lon).
     * Verifica se o ponto está dentro de algum dos raios cadastrados (utilizando as coordenadas do polígono)
     * e retorna o preço e o tempo médio de entrega do menor raio (mais restritivo) que contenha o ponto.
     */
    @Override
    public DeliveryPriceDTO getDeliveryPrice(String catalogId, double lat, double lon) {
        Delivery delivery = deliveryRepository.findByCatalogId(catalogId)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrado para o catálogo: " + catalogId));

        // Verifica se o delivery está ativo
        if (!delivery.isActive()) {
            return null;
        }

        // Filtra os raios cujo polígono contenha o ponto e seleciona o de menor raio
        DeliveryRadius matched = delivery.getRadii().stream()
                .filter(r -> r.getCoordinates() != null && !r.getCoordinates().isEmpty() &&
                        PolygonUtils.isPointInPolygon(lat, lon, r.getCoordinates()))
                .min(Comparator.comparingDouble(DeliveryRadius::getRadius))
                .orElse(null);

        if (matched == null) {
            return null;
        }
        return new DeliveryPriceDTO(matched.getPrice(), matched.getAverageDeliveryTime());
    }


    public DeliveryDTO getDeliveryByCatalogId(String catalogId) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findByCatalogId(catalogId);
        if (deliveryOpt.isEmpty()) {
            return null; // ou lance exceção
        }
        return mapToDTO(deliveryOpt.get());
    }

    @Override
    public DeliveryDTO getDeliveryById(String id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));
        return mapToDTO(delivery);
    }

    @Override
    public List<DeliveryDTO> getAllDeliveries() {
        return deliveryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteDelivery(String id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));
        deliveryRepository.delete(delivery);
    }

    // Métodos de mapeamento entre entidades e DTOs
    private DeliveryDTO mapToDTO(Delivery delivery) {
        DeliveryDTO dto = new DeliveryDTO();
        dto.setId(delivery.getId());
        dto.setCatalogId(delivery.getCatalog() != null ? delivery.getCatalog().getId() : null);
        dto.setActive(delivery.isActive());
        if (delivery.getRadii() != null) {
            List<DeliveryRadiusDTO> radiusDTOs = delivery.getRadii().stream()
                    .map(this::mapRadiusToDTO)
                    .collect(Collectors.toList());
            dto.setRadii(radiusDTOs);
        }
        return dto;
    }

    private DeliveryRadiusDTO mapRadiusToDTO(DeliveryRadius radius) {
        DeliveryRadiusDTO dto = new DeliveryRadiusDTO();
        dto.setId(radius.getId());
        dto.setRadius(radius.getRadius());
        dto.setPrice(radius.getPrice());
        // Novo campo: tempo médio de entrega
        dto.setAverageDeliveryTime(radius.getAverageDeliveryTime());
        if (radius.getCoordinates() != null) {
            List<DeliveryCoordinateDTO> coordDTOs = radius.getCoordinates().stream()
                    .map(this::mapCoordinateToDTO)
                    .collect(Collectors.toList());
            dto.setCoordinates(coordDTOs);
        }
        return dto;
    }

    private DeliveryCoordinateDTO mapCoordinateToDTO(DeliveryCoordinate coord) {
        DeliveryCoordinateDTO dto = new DeliveryCoordinateDTO();
        dto.setId(coord.getId());
        dto.setLatitude(coord.getLatitude());
        dto.setLongitude(coord.getLongitude());
        return dto;
    }

    private Delivery mapToEntity(DeliveryDTO dto) {
        Delivery delivery = new Delivery();
        delivery.setActive(dto.isActive());

        // Recupera o catálogo e atribui à entidade
        Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado"));
        delivery.setCatalog(catalog);

        if (dto.getRadii() != null) {
            List<DeliveryRadius> radiusList = dto.getRadii().stream()
                    .map(r -> mapRadiusToEntity(r, delivery))
                    .collect(Collectors.toList());
            delivery.setRadii(radiusList);
        }

        return delivery;
    }

    private DeliveryRadius mapRadiusToEntity(DeliveryRadiusDTO radiusDTO, Delivery delivery) {
        DeliveryRadius radius = new DeliveryRadius();
        radius.setDelivery(delivery);
        radius.setRadius(radiusDTO.getRadius());
        radius.setPrice(radiusDTO.getPrice());
        // Novo campo: tempo médio de entrega
        radius.setAverageDeliveryTime(radiusDTO.getAverageDeliveryTime());
        if (radiusDTO.getCoordinates() != null) {
            List<DeliveryCoordinate> coords = radiusDTO.getCoordinates().stream()
                    .map(c -> mapCoordinateToEntity(c, radius))
                    .collect(Collectors.toList());
            radius.setCoordinates(coords);
        }
        return radius;
    }

    private DeliveryCoordinate mapCoordinateToEntity(DeliveryCoordinateDTO coordDTO, DeliveryRadius radius) {
        DeliveryCoordinate coord = new DeliveryCoordinate();
        coord.setDeliveryRadius(radius);
        coord.setLatitude(coordDTO.getLatitude());
        coord.setLongitude(coordDTO.getLongitude());
        return coord;
    }
}
