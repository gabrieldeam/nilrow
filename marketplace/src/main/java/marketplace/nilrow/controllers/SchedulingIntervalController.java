package marketplace.nilrow.controllers;

import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingIntervalDTO;
import marketplace.nilrow.services.SchedulingIntervalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scheduling-intervals")
public class SchedulingIntervalController {

    @Autowired
    private SchedulingIntervalService schedulingIntervalService;

    // Cria um novo intervalo de agendamento
    @PostMapping
    public ResponseEntity<SchedulingIntervalDTO> create(@RequestBody SchedulingIntervalDTO dto) {
        SchedulingIntervalDTO created = schedulingIntervalService.create(dto);
        return ResponseEntity.ok(created);
    }

    // Atualiza um intervalo de agendamento existente
    @PutMapping("/{id}")
    public ResponseEntity<SchedulingIntervalDTO> update(@PathVariable String id, @RequestBody SchedulingIntervalDTO dto) {
        SchedulingIntervalDTO updated = schedulingIntervalService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Busca um intervalo específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<SchedulingIntervalDTO> findById(@PathVariable String id) {
        SchedulingIntervalDTO interval = schedulingIntervalService.findById(id);
        return ResponseEntity.ok(interval);
    }

    // Lista todos os intervalos de um Scheduling
    @GetMapping("/scheduling/{schedulingId}")
    public ResponseEntity<List<SchedulingIntervalDTO>> findBySchedulingId(@PathVariable String schedulingId) {
        List<SchedulingIntervalDTO> intervals = schedulingIntervalService.findBySchedulingId(schedulingId);
        return ResponseEntity.ok(intervals);
    }

    // Exclui um intervalo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        schedulingIntervalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
