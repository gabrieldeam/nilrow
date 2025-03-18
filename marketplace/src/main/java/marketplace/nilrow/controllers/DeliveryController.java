package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadiusDTO;
import marketplace.nilrow.services.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryDTO> createDelivery(@RequestBody DeliveryDTO deliveryDTO) {
        DeliveryDTO createdDelivery = deliveryService.createDelivery(deliveryDTO);
        return ResponseEntity.ok(createdDelivery);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryDTO> updateDelivery(@PathVariable String id,
                                                      @RequestBody DeliveryDTO deliveryDTO) {
        DeliveryDTO updatedDelivery = deliveryService.updateDelivery(id, deliveryDTO);
        return ResponseEntity.ok(updatedDelivery);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> getDeliveryById(@PathVariable String id) {
        DeliveryDTO delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(delivery);
    }

    @GetMapping
    public ResponseEntity<List<DeliveryDTO>> getAllDeliveries() {
        List<DeliveryDTO> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(deliveries);
    }

    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<DeliveryDTO> getDeliveryByCatalog(@PathVariable String catalogId) {
        DeliveryDTO dto = deliveryService.getDeliveryByCatalogId(catalogId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable String id) {
        deliveryService.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{deliveryId}/radii")
    public ResponseEntity<DeliveryDTO> updateDeliveryRadii(@PathVariable String deliveryId,
                                                           @RequestBody List<DeliveryRadiusDTO> radiiDTOs) {
        DeliveryDTO updatedDelivery = deliveryService.updateDeliveryRadii(deliveryId, radiiDTOs);
        return ResponseEntity.ok(updatedDelivery);
    }


}