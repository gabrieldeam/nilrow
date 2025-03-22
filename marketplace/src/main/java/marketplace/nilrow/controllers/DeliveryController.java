package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryPriceDTO;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadiusDTO;
import marketplace.nilrow.services.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    @PostMapping("/{deliveryId}/radii")
    public ResponseEntity<DeliveryDTO> addDeliveryRadius(@PathVariable String deliveryId,
                                                         @RequestBody DeliveryRadiusDTO radiusDTO) {
        DeliveryDTO updatedDelivery = deliveryService.addDeliveryRadius(deliveryId, radiusDTO);
        return ResponseEntity.ok(updatedDelivery);
    }

    @PutMapping("/{deliveryId}/radii/{radiusId}")
    public ResponseEntity<DeliveryDTO> updateDeliveryRadius(@PathVariable String deliveryId,
                                                            @PathVariable String radiusId,
                                                            @RequestBody DeliveryRadiusDTO radiusDTO) {
        // Garante que o DTO tenha o mesmo id do path
        radiusDTO.setId(radiusId);
        DeliveryDTO updatedDelivery = deliveryService.updateDeliveryRadius(deliveryId, radiusDTO);
        return ResponseEntity.ok(updatedDelivery);
    }

    @DeleteMapping("/{deliveryId}/radii/{radiusId}")
    public ResponseEntity<DeliveryDTO> deleteDeliveryRadius(@PathVariable String deliveryId,
                                                            @PathVariable String radiusId) {
        DeliveryDTO updatedDelivery = deliveryService.deleteDeliveryRadius(deliveryId, radiusId);
        return ResponseEntity.ok(updatedDelivery);
    }

    @GetMapping("/{catalogId}/price")
    public ResponseEntity<DeliveryPriceDTO> getDeliveryPrice(
            @PathVariable String catalogId,
            @RequestParam double lat,
            @RequestParam double lon) {
        DeliveryPriceDTO priceDto = deliveryService.getDeliveryPrice(catalogId, lat, lon);
        if (priceDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(priceDto);
    }

    @GetMapping("/catalog/{catalogId}/active")
    public ResponseEntity<Boolean> getDeliveryActiveByCatalog(@PathVariable String catalogId) {
        DeliveryDTO dto = deliveryService.getDeliveryByCatalogId(catalogId);
        if (dto == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(dto.isActive());
    }

}