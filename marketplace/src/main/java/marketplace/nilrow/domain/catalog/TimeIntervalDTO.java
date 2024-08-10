package marketplace.nilrow.domain.catalog;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeIntervalDTO {
    private String openTime;  // Formato 'HH:mm'
    private String closeTime; // Formato 'HH:mm'
}