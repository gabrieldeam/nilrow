package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.coupon.*;
import marketplace.nilrow.services.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/coupons")
public class CouponController {

    private final CouponService service;

    public CouponController(CouponService service) { this.service = service; }

    /* --- CRUD principal --- */

    @PostMapping
    public ResponseEntity<CouponDTO> create(@RequestBody CouponDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponDTO> update(@PathVariable String id,
                                            @RequestBody CouponDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/catalog/{catalogId}/code/{code}")
    public ResponseEntity<CouponDTO> getByCode(@PathVariable String catalogId,
                                               @PathVariable String code) {
        CouponDTO dto = service.getByCode(catalogId, code);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    /* --- Radii --- */

    @PostMapping("/{couponId}/radii")
    public ResponseEntity<CouponDTO> addRadius(@PathVariable String couponId,
                                               @RequestBody CouponRadiusDTO dto) {
        return ResponseEntity.ok(service.addRadius(couponId, dto));
    }

    @PutMapping("/{couponId}/radii/{radiusId}")
    public ResponseEntity<CouponDTO> updateRadius(@PathVariable String couponId,
                                                  @PathVariable String radiusId,
                                                  @RequestBody CouponRadiusDTO dto) {
        dto.setId(radiusId);
        return ResponseEntity.ok(service.updateRadius(couponId, dto));
    }

    @DeleteMapping("/{couponId}/radii/{radiusId}")
    public ResponseEntity<CouponDTO> deleteRadius(@PathVariable String couponId,
                                                  @PathVariable String radiusId) {
        return ResponseEntity.ok(service.deleteRadius(couponId, radiusId));
    }

    /* --- Checar elegibilidade --- */

    @GetMapping("/check/{catalogId}/{code}")
    public ResponseEntity<CouponAvailabilityDTO> check(@PathVariable String catalogId,
                                                       @PathVariable String code,
                                                       @RequestParam String userId,
                                                       @RequestParam BigDecimal cartTotal,
                                                       @RequestParam double lat,
                                                       @RequestParam double lon,
                                                       @RequestParam(required = false) String productId,
                                                       @RequestParam(required = false) String categoryId,
                                                       @RequestParam(required = false) String subCategoryId) {

        return ResponseEntity.ok(
                service.checkCoupon(catalogId, code, userId, cartTotal,
                        lat, lon, productId, categoryId, subCategoryId));
    }

    /* --- Atalho: ativo? --- */
    @GetMapping("/catalog/{catalogId}/code/{code}/active")
    public ResponseEntity<Boolean> isActive(@PathVariable String catalogId,
                                            @PathVariable String code) {
        CouponDTO dto = service.getByCode(catalogId, code);
        return ResponseEntity.ok(dto != null && dto.isActive());
    }
}
