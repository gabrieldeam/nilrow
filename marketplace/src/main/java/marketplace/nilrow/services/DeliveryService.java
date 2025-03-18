package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadiusDTO;

import java.util.List;

public interface DeliveryService {
    DeliveryDTO createDelivery(DeliveryDTO deliveryDTO);
    DeliveryDTO updateDelivery(String id, DeliveryDTO deliveryDTO);
    DeliveryDTO getDeliveryById(String id);
    DeliveryDTO getDeliveryByCatalogId(String catalogId);
    List<DeliveryDTO> getAllDeliveries();
    void deleteDelivery(String id);
    DeliveryDTO updateDeliveryRadii(String deliveryId, List<DeliveryRadiusDTO> radiiDTOs);
}