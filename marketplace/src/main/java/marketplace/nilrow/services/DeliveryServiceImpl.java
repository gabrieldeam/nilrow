package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.shipping.delivery.*;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    public DeliveryDTO updateDeliveryRadii(String deliveryId, List<DeliveryRadiusDTO> newRadiiDTOs) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery não encontrada"));

        // Garante que não seja null
        if (delivery.getRadii() == null) {
            delivery.setRadii(new ArrayList<>());
        }

        // Mapeia os raios já existentes por ID, para acessar rapidamente
        Map<String, DeliveryRadius> existingById = delivery.getRadii().stream()
                .filter(r -> r.getId() != null)       // só pega quem já tem ID
                .collect(Collectors.toMap(DeliveryRadius::getId, r -> r));

        // Nova lista que iremos popular
        List<DeliveryRadius> updatedRadii = new ArrayList<>();

        // Percorre a lista de DTOs recebida
        for (DeliveryRadiusDTO radiusDTO : newRadiiDTOs) {
            DeliveryRadius radiusEntity;
            // Se existe ID e já consta no mapa, atualizamos em vez de criar
            if (radiusDTO.getId() != null && existingById.containsKey(radiusDTO.getId())) {
                radiusEntity = existingById.get(radiusDTO.getId());
            } else {
                // Senao, criamos um novo
                radiusEntity = new DeliveryRadius();
                radiusEntity.setDelivery(delivery);
            }

            // Atualiza campos básicos
            radiusEntity.setRadius(radiusDTO.getRadius());
            radiusEntity.setPrice(radiusDTO.getPrice());

            // Atualiza as coordenadas
            radiusEntity.setCoordinates(updateCoordinates(radiusEntity, radiusDTO.getCoordinates()));

            // Adiciona na lista final
            updatedRadii.add(radiusEntity);
        }

        // Limpa a lista original e coloca só o que queremos manter
        delivery.getRadii().clear();
        delivery.getRadii().addAll(updatedRadii);

        Delivery saved = deliveryRepository.save(delivery);
        return mapToDTO(saved);
    }

    // Exemplo de método auxiliar para coordenadas
    private List<DeliveryCoordinate> updateCoordinates(
            DeliveryRadius radiusEntity,
            List<DeliveryCoordinateDTO> coordDTOs
    ) {
        if (coordDTOs == null) {
            return new ArrayList<>();
        }

        // Mesmo princípio se quiser evitar problemas de orphanRemoval:
        // Carregar as coordenadas atuais e tratar em lugar
        // Mas se for sempre sobrescrever, pode fazer mais simples:

        List<DeliveryCoordinate> coords = new ArrayList<>();
        for (DeliveryCoordinateDTO dto : coordDTOs) {
            DeliveryCoordinate coord = new DeliveryCoordinate();
            coord.setDeliveryRadius(radiusEntity);
            coord.setLatitude(dto.getLatitude());
            coord.setLongitude(dto.getLongitude());
            coords.add(coord);
        }
        return coords;
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

    // Mapeamento simples entre DTO e entidade (ajuste conforme necessário)
    private DeliveryDTO mapToDTO(Delivery delivery) {
        DeliveryDTO dto = new DeliveryDTO();
        dto.setId(delivery.getId());
        dto.setCatalogId(delivery.getCatalog() != null ? delivery.getCatalog().getId() : null);
        dto.setActive(delivery.isActive());

        // Preenche radii
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