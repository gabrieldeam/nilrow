package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryPriceDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadiusDTO;

import java.math.BigDecimal;
import java.util.List;

public interface DeliveryService {
    DeliveryDTO createDelivery(DeliveryDTO deliveryDTO);
    DeliveryDTO updateDelivery(String id, DeliveryDTO deliveryDTO);
    DeliveryDTO getDeliveryById(String id);
    DeliveryDTO getDeliveryByCatalogId(String catalogId);
    List<DeliveryDTO> getAllDeliveries();
    void deleteDelivery(String id);
    DeliveryDTO addDeliveryRadius(String deliveryId, DeliveryRadiusDTO radiusDTO);
    DeliveryDTO updateDeliveryRadius(String deliveryId, DeliveryRadiusDTO radiusDTO);
    DeliveryDTO deleteDeliveryRadius(String deliveryId, String radiusId);
    DeliveryPriceDTO getDeliveryPrice(String catalogId, double lat, double lon);
}