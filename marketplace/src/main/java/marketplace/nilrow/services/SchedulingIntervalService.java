package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.scheduling.Scheduling;
import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingInterval;
import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingIntervalDTO;
import marketplace.nilrow.repositories.SchedulingIntervalRepository;
import marketplace.nilrow.repositories.SchedulingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchedulingIntervalService {

    @Autowired
    private SchedulingIntervalRepository schedulingIntervalRepository;

    @Autowired
    private SchedulingRepository schedulingRepository;

    /**
     * Converte a entidade SchedulingInterval para DTO.
     */
    private SchedulingIntervalDTO convertToDTO(SchedulingInterval interval) {
        SchedulingIntervalDTO dto = new SchedulingIntervalDTO();
        dto.setId(interval.getId());
        dto.setSchedulingId(interval.getScheduling().getId());
        dto.setStartTime(interval.getStartTime());
        dto.setEndTime(interval.getEndTime());
        dto.setMaxAppointments(interval.getMaxAppointments());
        return dto;
    }

    /**
     * Converte o DTO em uma entidade SchedulingInterval.
     */
    private SchedulingInterval convertToEntity(SchedulingIntervalDTO dto) {
        Scheduling scheduling = schedulingRepository.findById(dto.getSchedulingId())
                .orElseThrow(() -> new RuntimeException("Scheduling não encontrado: " + dto.getSchedulingId()));

        SchedulingInterval interval = new SchedulingInterval();
        interval.setScheduling(scheduling);
        interval.setStartTime(dto.getStartTime());
        interval.setEndTime(dto.getEndTime());
        interval.setMaxAppointments(dto.getMaxAppointments());
        return interval;
    }

    /**
     * Cria um novo intervalo de agendamento.
     */
    public SchedulingIntervalDTO create(SchedulingIntervalDTO dto) {
        SchedulingInterval interval = convertToEntity(dto);
        SchedulingInterval saved = schedulingIntervalRepository.save(interval);
        return convertToDTO(saved);
    }

    /**
     * Atualiza um intervalo de agendamento existente pelo ID.
     */
    public SchedulingIntervalDTO update(String id, SchedulingIntervalDTO dto) {
        SchedulingInterval interval = schedulingIntervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SchedulingInterval não encontrado: " + id));

        // Se schedulingId vier nulo, não mexe
        if (dto.getSchedulingId() != null) {
            Scheduling scheduling = schedulingRepository.findById(dto.getSchedulingId())
                    .orElseThrow(() -> new RuntimeException("Scheduling não encontrado: " + dto.getSchedulingId()));
            interval.setScheduling(scheduling);
        }

        // startTime, endTime e maxAppointments também podem ser tratados como partial:
        if (dto.getStartTime() != null) {
            interval.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            interval.setEndTime(dto.getEndTime());
        }
        // Se maxAppointments for primitivo (int), escolha um valor default ou troque para Integer
        if (dto.getMaxAppointments() != null) {
            interval.setMaxAppointments(dto.getMaxAppointments());
        }

        SchedulingInterval updated = schedulingIntervalRepository.save(interval);
        return convertToDTO(updated);
    }


    /**
     * Retorna um intervalo específico pelo ID.
     */
    public SchedulingIntervalDTO findById(String id) {
        SchedulingInterval interval = schedulingIntervalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SchedulingInterval não encontrado: " + id));
        return convertToDTO(interval);
    }

    /**
     * Lista todos os intervalos de um Scheduling específico.
     */
    public List<SchedulingIntervalDTO> findBySchedulingId(String schedulingId) {
        List<SchedulingInterval> intervals = schedulingIntervalRepository.findByScheduling_Id(schedulingId);
        return intervals.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Exclui um intervalo de agendamento.
     */
    public void delete(String id) {
        if (!schedulingIntervalRepository.existsById(id)) {
            throw new RuntimeException("SchedulingInterval não encontrado: " + id);
        }
        schedulingIntervalRepository.deleteById(id);
    }
}
