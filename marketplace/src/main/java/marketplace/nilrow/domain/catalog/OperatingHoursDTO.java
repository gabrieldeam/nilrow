package marketplace.nilrow.domain.catalog;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperatingHoursDTO {
    private String dayOfWeek; // 'Domingo', 'Segunda', ..., 'Sábado'

    @JsonProperty("is24Hours")
    private boolean is24Hours;
    private boolean isClosed;
    private List<TimeIntervalDTO> timeIntervals; // Lista de intervalos de abertura
}