package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.freeshipping.*;
import marketplace.nilrow.services.FreeShippingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/free-shippings")
public class FreeShippingController {

    @Autowired private FreeShippingService service;

    // --- CRUD básico ---

    @PostMapping
    public ResponseEntity<FreeShippingDTO> create(@RequestBody FreeShippingDTO dto) {
        return ResponseEntity.ok(service.createFreeShipping(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FreeShippingDTO> update(@PathVariable String id,
                                                  @RequestBody FreeShippingDTO dto) {
        return ResponseEntity.ok(service.updateFreeShipping(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FreeShippingDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getFreeShippingById(id));
    }

    @GetMapping
    public ResponseEntity<List<FreeShippingDTO>> getAll() {
        return ResponseEntity.ok(service.getAllFreeShippings());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteFreeShipping(id);
        return ResponseEntity.noContent().build();
    }

    // --- Por catálogo ---

    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<FreeShippingDTO> getByCatalog(@PathVariable String catalogId) {
        FreeShippingDTO dto = service.getFreeShippingByCatalogId(catalogId);
        return (dto == null) ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    // --- Radii ---

    @PostMapping("/{fsId}/radii")
    public ResponseEntity<FreeShippingDTO> addRadius(@PathVariable String fsId,
                                                     @RequestBody FreeShippingRadiusDTO dto) {
        return ResponseEntity.ok(service.addFreeShippingRadius(fsId, dto));
    }

    @PutMapping("/{fsId}/radii/{radiusId}")
    public ResponseEntity<FreeShippingDTO> updateRadius(@PathVariable String fsId,
                                                        @PathVariable String radiusId,
                                                        @RequestBody FreeShippingRadiusDTO dto) {
        dto.setId(radiusId);
        return ResponseEntity.ok(service.updateFreeShippingRadius(fsId, dto));
    }

    @DeleteMapping("/{fsId}/radii/{radiusId}")
    public ResponseEntity<FreeShippingDTO> deleteRadius(@PathVariable String fsId,
                                                        @PathVariable String radiusId) {
        return ResponseEntity.ok(service.deleteFreeShippingRadius(fsId, radiusId));
    }

    // --- Checar elegibilidade ---

    @GetMapping("/{catalogId}/check")
    public ResponseEntity<FreeShippingAvailabilityDTO> check(
            @PathVariable String catalogId,
            @RequestParam BigDecimal cartTotal,
            @RequestParam double lat,
            @RequestParam double lon) {

        return ResponseEntity.ok(service.checkFreeShipping(catalogId, cartTotal, lat, lon));
    }

    // Ativo ou não (atalho)
    @GetMapping("/catalog/{catalogId}/active")
    public ResponseEntity<Boolean> isActive(@PathVariable String catalogId) {
        FreeShippingDTO dto = service.getFreeShippingByCatalogId(catalogId);
        return ResponseEntity.ok(dto != null && dto.isActive());
    }
}
