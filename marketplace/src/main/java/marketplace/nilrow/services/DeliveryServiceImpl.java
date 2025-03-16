package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.delivery.Delivery;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import marketplace.nilrow.repositories.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

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
        // O mapeamento dos "radii" foi omitido para simplificação
        return dto;
    }

    private Delivery mapToEntity(DeliveryDTO dto) {
        Delivery delivery = new Delivery();
        // Como a associação com Catalog geralmente envolve buscar o objeto Catalog,
        // aqui estamos apenas setando a flag "active". Ajuste conforme sua lógica.
        delivery.setActive(dto.isActive());
        // O mapeamento dos "radii" foi omitido para simplificação
        return delivery;
    }
}