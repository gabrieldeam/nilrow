package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingDTO;
import marketplace.nilrow.services.SchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedulings")
public class SchedulingController {

    @Autowired
    private SchedulingService schedulingService;

    // Criação de um Scheduling
    @PostMapping
    public ResponseEntity<SchedulingDTO> create(@RequestBody SchedulingDTO dto) {
        SchedulingDTO created = schedulingService.create(dto);
        return ResponseEntity.ok(created);
    }

    // Atualização de um Scheduling pelo ID
    @PutMapping("/{id}")
    public ResponseEntity<SchedulingDTO> update(@PathVariable String id, @RequestBody SchedulingDTO dto) {
        SchedulingDTO updated = schedulingService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Busca de um Scheduling pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<SchedulingDTO> findById(@PathVariable String id) {
        SchedulingDTO scheduling = schedulingService.findById(id);
        return ResponseEntity.ok(scheduling);
    }

    // Lista todos os Schedulings de um catálogo
    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<SchedulingDTO>> findByCatalogId(@PathVariable String catalogId) {
        List<SchedulingDTO> schedulings = schedulingService.findByCatalogId(catalogId);
        return ResponseEntity.ok(schedulings);
    }

    // Exclusão de um Scheduling
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        schedulingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
