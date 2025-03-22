package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.pickup.PickupActiveDetailsDTO;
import marketplace.nilrow.domain.catalog.shipping.pickup.PickupDTO;
import marketplace.nilrow.services.PickupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pickups")
public class PickupController {

    @Autowired
    private PickupService pickupService;

    // Listar todos os pickups
    @GetMapping
    public ResponseEntity<List<PickupDTO>> getAllPickups() {
        List<PickupDTO> pickups = pickupService.findAll();
        return ResponseEntity.ok(pickups);
    }

    // Obter pickup por id
    @GetMapping("/{id}")
    public ResponseEntity<PickupDTO> getPickupById(@PathVariable String id) {
        PickupDTO dto = pickupService.findById(id);
        return ResponseEntity.ok(dto);
    }

    // Buscar pickup pelo catalogId
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<PickupDTO> getPickupByCatalogId(@PathVariable String catalogId) {
        PickupDTO dto = pickupService.findByCatalogId(catalogId);
        return ResponseEntity.ok(dto);
    }

    // Novo endpoint: busca pickup ativo e retorna prazo, preço e endereço do catálogo
    @GetMapping("/catalog/{catalogId}/active-details")
    public ResponseEntity<PickupActiveDetailsDTO> getActivePickupDetailsByCatalogId(@PathVariable String catalogId) {
        PickupActiveDetailsDTO details = pickupService.findActivePickupDetailsByCatalogId(catalogId);
        return ResponseEntity.ok(details);
    }

    // Criar ou atualizar pickup (se já existir para o catálogo, atualiza)
    @PostMapping
    public ResponseEntity<PickupDTO> createPickup(@RequestBody PickupDTO pickupDTO) {
        PickupDTO created = pickupService.create(pickupDTO);
        return ResponseEntity.ok(created);
    }

    // Atualizar pickup existente
    @PutMapping("/{id}")
    public ResponseEntity<PickupDTO> updatePickup(@PathVariable String id, @RequestBody PickupDTO pickupDTO) {
        PickupDTO updated = pickupService.update(id, pickupDTO);
        return ResponseEntity.ok(updated);
    }

    // Excluir pickup
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePickup(@PathVariable String id) {
        pickupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Novo endpoint que retorna o 'active' pelo catalogId
    @GetMapping("/catalog/{catalogId}/active")
    public ResponseEntity<Boolean> getActiveByCatalog(@PathVariable String catalogId) {
        Boolean active = pickupService.getActiveByCatalogId(catalogId);
        return ResponseEntity.ok(active);
    }

}
