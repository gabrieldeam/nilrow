package marketplace.nilrow.controllers;

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

    // Criar novo pickup
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
}