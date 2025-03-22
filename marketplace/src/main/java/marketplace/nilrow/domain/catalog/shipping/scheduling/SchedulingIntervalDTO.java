package marketplace.nilrow.domain.catalog.shipping.scheduling;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * DTO para criar/atualizar um intervalo de agendamento.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingIntervalDTO {
    private String id;
    private String schedulingId;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxAppointments;
}
