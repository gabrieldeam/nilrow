package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import java.util.List;

public interface DeliveryService {
    DeliveryDTO createDelivery(DeliveryDTO deliveryDTO);
    DeliveryDTO updateDelivery(String id, DeliveryDTO deliveryDTO);
    DeliveryDTO getDeliveryById(String id);
    List<DeliveryDTO> getAllDeliveries();
    void deleteDelivery(String id);
}