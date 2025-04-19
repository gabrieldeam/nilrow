package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.freeshipping.*;

import java.math.BigDecimal;
import java.util.List;

public interface FreeShippingService {
    FreeShippingDTO createFreeShipping(FreeShippingDTO dto);
    FreeShippingDTO updateFreeShipping(String id, FreeShippingDTO dto);
    FreeShippingDTO getFreeShippingById(String id);
    FreeShippingDTO getFreeShippingByCatalogId(String catalogId);
    List<FreeShippingDTO> getAllFreeShippings();
    void deleteFreeShipping(String id);

    FreeShippingDTO addFreeShippingRadius(String freeShippingId, FreeShippingRadiusDTO radiusDTO);
    FreeShippingDTO updateFreeShippingRadius(String freeShippingId, FreeShippingRadiusDTO radiusDTO);
    FreeShippingDTO deleteFreeShippingRadius(String freeShippingId, String radiusId);

    FreeShippingAvailabilityDTO checkFreeShipping(String catalogId,
                                                  BigDecimal cartTotal,
                                                  double lat,
                                                  double lon);
}
